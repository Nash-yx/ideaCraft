const { Idea, Favorite, View } = require('../models')
const { Op } = require('sequelize')
const sequelize = Idea.sequelize

const hotnessServices = {
  /**
   * 計算熱門度分數
   * @param {Object} idea - idea對象，需包含createdAt
   * @param {number} favoriteCount - 收藏數
   * @param {number} viewCount - 瀏覽數
   * @returns {number} 熱門度分數
   */
  calculateHotScore: (idea, favoriteCount, viewCount) => {
    const now = new Date()
    const createdAt = new Date(idea.createdAt)
    const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24)

    // 時間衰減因子：每週衰減20%
    const timeDecayFactor = Math.pow(0.8, daysSinceCreated / 7)

    // 新內容冷啟動保護：24小時內額外加權50%
    const newContentBoost = daysSinceCreated < 1 ? 1.5 : 1

    // 基礎分數：收藏權重5，瀏覽權重0.1
    const baseScore = (favoriteCount * 5) + (viewCount * 0.1)

    // 最終熱門度分數
    const hotScore = baseScore * timeDecayFactor * newContentBoost

    return Math.max(hotScore, 0) // 確保非負數
  },

  /**
   * 批量計算多個ideas的熱門度分數
   * @param {Array} ideasWithStats - 包含統計數據的ideas數組
   * @returns {Array} 包含熱門度分數的ideas數組
   */
  calculateBulkHotScores: (ideasWithStats) => {
    return ideasWithStats.map(item => ({
      ...item,
      hotScore: hotnessServices.calculateHotScore(
        item.idea || item,
        item.favoriteCount || 0,
        item.viewCount || 0
      )
    }))
  },

  /**
   * 根據熱門度分數排序ideas
   * @param {Array} ideasWithHotScores - 包含熱門度分數的ideas數組
   * @param {string} order - 排序方向 'DESC' | 'ASC'
   * @returns {Array} 排序後的ideas數組
   */
  sortByHotness: (ideasWithHotScores, order = 'DESC') => {
    return ideasWithHotScores.sort((a, b) => {
      if (order === 'DESC') {
        return b.hotScore - a.hotScore
      } else {
        return a.hotScore - b.hotScore
      }
    })
  },

  /**
   * 獲取時間衰減因子（供測試使用）
   * @param {Date} createdAt - 創建時間
   * @returns {number} 時間衰減因子
   */
  getTimeDecayFactor: (createdAt) => {
    const now = new Date()
    const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24)
    return Math.pow(0.8, daysSinceCreated / 7)
  },

  /**
   * 檢查是否為新內容（供測試使用）
   * @param {Date} createdAt - 創建時間
   * @returns {boolean} 是否為24小時內的新內容
   */
  isNewContent: (createdAt) => {
    const now = new Date()
    const daysSinceCreated = (now - createdAt) / (1000 * 60 * 60 * 24)
    return daysSinceCreated < 1
  },

  /**
   * 更新單一想法的熱門度分數
   * @param {number} ideaId - 想法ID
   * @returns {Promise<Object>} 更新結果
   */
  updateSingleIdeaHotness: async (ideaId) => {
    try {
      // 1. 獲取想法基本資訊
      const idea = await Idea.findByPk(ideaId, {
        attributes: ['id', 'createdAt', 'isPublic']
      })

      if (!idea) {
        throw new Error('Idea not found')
      }

      // 2. 只處理公開想法
      if (!idea.isPublic) {
        await idea.update({
          hotnessScore: 0,
          lastHotnessUpdate: new Date()
        })
        return { success: true, hotnessScore: 0 }
      }

      // 3. 並行查詢統計數據
      const [favoriteCount, viewCount] = await Promise.all([
        Favorite.count({ where: { ideaId } }),
        View.count({ where: { ideaId } })
      ])

      // 4. 計算熱門度分數
      const hotnessScore = hotnessServices.calculateHotScore(
        idea.toJSON(),
        favoriteCount,
        viewCount
      )

      // 5. 更新到資料庫
      await idea.update({
        hotnessScore: Math.round(hotnessScore * 100) / 100, // 保留2位小數
        lastHotnessUpdate: new Date()
      })

      return {
        success: true,
        ideaId,
        hotnessScore,
        favoriteCount,
        viewCount
      }
    } catch (error) {
      console.error(`Failed to update hotness for idea ${ideaId}:`, error.message)
      return { success: false, error: error.message }
    }
  },

  /**
   * 批次更新所有公開想法的熱門度分數
   * @param {Object} options - 選項
   * @param {number} options.batchSize - 每批處理的數量，預設100
   * @param {boolean} options.forceUpdate - 是否強制更新所有記錄，預設false
   * @returns {Promise<Object>} 更新結果統計
   */
  updateAllHotnessScores: async (options = {}) => {
    const { batchSize = 100, forceUpdate = false } = options

    const startTime = Date.now()
    let processedCount = 0
    let errorCount = 0
    const errors = []

    try {
      // 1. 建立更新條件
      const whereCondition = {
        isPublic: true
      }

      // 如果不強制更新，只更新超過30分鐘沒更新的記錄
      if (!forceUpdate) {
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
        whereCondition[Op.or] = [
          { lastHotnessUpdate: null },
          { lastHotnessUpdate: { [Op.lt]: thirtyMinutesAgo } }
        ]
      }

      // 2. 獲取需要更新的想法總數
      const totalCount = await Idea.count({ where: whereCondition })

      if (totalCount === 0) {
        return {
          success: true,
          message: 'No ideas need updating',
          processedCount: 0,
          totalCount: 0,
          duration: Date.now() - startTime
        }
      }

      console.log(`Starting batch hotness update for ${totalCount} ideas...`)

      // 3. 分批處理
      let offset = 0
      while (offset < totalCount) {
        try {
          // 獲取一批想法
          const ideas = await Idea.findAll({
            where: whereCondition,
            attributes: ['id', 'createdAt'],
            limit: batchSize,
            offset,
            order: [['id', 'ASC']] // 確保一致的順序
          })

          if (ideas.length === 0) break

          // 獲取這批想法的統計數據
          const ideaIds = ideas.map(idea => idea.id)

          const [favoriteStats, viewStats] = await Promise.all([
            Favorite.findAll({
              where: { ideaId: { [Op.in]: ideaIds } },
              attributes: [
                'ideaId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
              ],
              group: ['ideaId'],
              raw: true
            }),
            View.findAll({
              where: { ideaId: { [Op.in]: ideaIds } },
              attributes: [
                'ideaId',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
              ],
              group: ['ideaId'],
              raw: true
            })
          ])

          // 建立統計數據映射
          const favoriteMap = new Map(favoriteStats.map(stat => [stat.ideaId, parseInt(stat.count) || 0]))
          const viewMap = new Map(viewStats.map(stat => [stat.ideaId, parseInt(stat.count) || 0]))

          // 計算並更新每個想法的熱門度分數
          const updatePromises = ideas.map(async (idea) => {
            try {
              const favoriteCount = favoriteMap.get(idea.id) || 0
              const viewCount = viewMap.get(idea.id) || 0

              const hotnessScore = hotnessServices.calculateHotScore(
                idea.toJSON(),
                favoriteCount,
                viewCount
              )

              await Idea.update({
                hotnessScore: Math.round(hotnessScore * 100) / 100,
                lastHotnessUpdate: new Date()
              }, {
                where: { id: idea.id }
              })

              return { success: true, ideaId: idea.id }
            } catch (error) {
              errorCount++
              errors.push({ ideaId: idea.id, error: error.message })
              console.error(`Failed to update idea ${idea.id}:`, error.message)
              return { success: false, ideaId: idea.id }
            }
          })

          await Promise.all(updatePromises)
          processedCount += ideas.length

          // 進度報告
          if (processedCount % (batchSize * 5) === 0) {
            console.log(`Processed ${processedCount}/${totalCount} ideas (${Math.round(processedCount / totalCount * 100)}%)`)
          }

          offset += batchSize
        } catch (batchError) {
          console.error(`Batch processing error at offset ${offset}:`, batchError.message)
          errorCount += batchSize
          offset += batchSize
        }
      }

      const duration = Date.now() - startTime
      const result = {
        success: errorCount < processedCount / 2, // 如果錯誤率小於50%視為成功
        processedCount,
        errorCount,
        totalCount,
        duration,
        message: `Processed ${processedCount} ideas with ${errorCount} errors in ${duration}ms`
      }

      if (errors.length > 0 && errors.length <= 10) {
        result.sampleErrors = errors.slice(0, 10) // 只保留前10個錯誤作為樣本
      }

      console.log(`Batch hotness update completed: ${result.message}`)
      return result
    } catch (error) {
      console.error('Fatal error in batch hotness update:', error.message)
      return {
        success: false,
        error: error.message,
        processedCount,
        errorCount,
        duration: Date.now() - startTime
      }
    }
  }
}

module.exports = hotnessServices
