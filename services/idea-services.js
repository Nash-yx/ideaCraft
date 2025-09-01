const { Idea, User, Tag, Favorite, View } = require('../models')
const { v4: uuidv4 } = require('uuid')
const hotnessServices = require('./hotness-services')

const ideaServices = {
  getIdeas: async (req) => {
    const userId = req.user.id
    const ideas = await Idea.findAll({
      where: { userId },
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] } // 不包含關聯表的額外欄位, 不加 => tag: [{ ..., IdeaTag: { ... }, ...}]
      }],
      order: [['createdAt', 'DESC']],
      raw: false,
      nest: true
    })

    return ideas.map(idea => idea.toJSON()) // 回傳空陣列也是正常的
  },
  postIdea: async (req) => {
    const { title, content, isPublic, tags } = req.body
    const userId = req.user.id

    // 輸入驗證
    if (!title || !title.trim()) {
      throw new Error('Title is required')
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required')
    }

    // 準備建立資料
    const ideaData = {
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === 'true' || isPublic === true,
      userId
    }

    // 如果是公開的idea，產生分享連結
    if (ideaData.isPublic) {
      ideaData.shareLink = uuidv4()
    }

    // 建立 idea
    const idea = await Idea.create(ideaData)

    // 處理標籤 (如果有提供)
    if (tags) {
      let tagNames = []

      // 處理不同格式的標籤輸入
      if (typeof tags === 'string') {
        try {
          // 嘗試解析 JSON 字串 , ex: '["frontend", "react"]'
          tagNames = JSON.parse(tags)
        } catch {
          // 如果不是 JSON，當作逗號分隔的字串處理 , ex: "frontend,react,javascript"
          tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      } else if (Array.isArray(tags)) {
        // ex: ["frontend", "react"]
        tagNames = tags
      }

      // 關聯 tag 到 idea
      await ideaServices.associateTagsWithIdea(idea, tagNames)
    }

    // 如果是公開想法，初始化熱門度分數
    if (ideaData.isPublic) {
      try {
        await hotnessServices.updateSingleIdeaHotness(idea.id)
      } catch (error) {
        console.error(`Failed to initialize hotness score for new idea ${idea.id}:`, error.message)
      }
    }

    return idea
  },
  getIdea: async (req) => {
    const idea = await Idea.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }, {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      raw: false,
      nest: true
    })

    if (!idea) throw new Error('Idea not found')

    if (idea.userId !== req.user.id) {
      throw new Error('Unauthorized access')
    }

    return idea.toJSON()
  },
  updateIdea: async (req) => {
    const { title, content, isPublic, tags } = req.body
    const ideaId = req.params.id
    const userId = req.user.id

    // 輸入驗證
    if (!title || !title.trim()) {
      throw new Error('Title is required')
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required')
    }

    // 找到並驗證權限
    const idea = await Idea.findByPk(ideaId)
    if (!idea) throw new Error('Idea not found')
    if (idea.userId !== userId) throw new Error('Unauthorized access')

    // 準備更新資料
    const updateData = {
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === 'true' || isPublic === true
    }

    // 處理 shareLink
    if (updateData.isPublic && !idea.shareLink) {
      updateData.shareLink = uuidv4()
    } else if (!updateData.isPublic) {
      updateData.shareLink = null
    }

    // 更新 idea 基本資料
    const updatedIdea = await idea.update(updateData)

    // 處理標籤更新
    if (tags !== undefined) {
      let tagNames = []

      // 處理不同格式的標籤輸入
      if (typeof tags === 'string') {
        try {
          // 嘗試解析 JSON 字串
          tagNames = JSON.parse(tags)
        } catch {
          // 如果不是 JSON，當作逗號分隔的字串處理
          tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      } else if (Array.isArray(tags)) {
        tagNames = tags
      }

      // 更新標籤關聯 (會移除舊的關聯並建立新的)
      await ideaServices.associateTagsWithIdea(idea, tagNames)

      // 清理孤立的標籤 (在背景執行，不等待結果)
      setTimeout(() => {
        ideaServices.cleanupOrphanedTags().catch(console.error)
      }, 1000)
    }

    return updatedIdea
  },
  deleteIdea: async (req) => {
    const ideaId = req.params.id
    const userId = req.user.id

    // 找到並驗證權限
    const idea = await Idea.findByPk(ideaId)
    if (!idea) throw new Error('Idea not found')
    if (idea.userId !== userId) throw new Error('Unauthorized access')

    // 執行刪除
    await idea.destroy()
  },
  getPublicIdeas: async (searchQuery = '', userId = null) => {
    const { Op } = require('sequelize')
    const sequelize = Idea.sequelize

    // 基本查詢條件
    let whereCondition = { isPublic: true }

    // 處理搜尋條件
    if (searchQuery && searchQuery.trim()) {
      const safeQuery = ideaServices.safeSearch(searchQuery.trim())
      if (safeQuery) {
        const searchConditions = await ideaServices.buildSearchConditions(safeQuery)
        whereCondition = { ...whereCondition, ...searchConditions }
      }
    }

    const ideas = await Idea.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']], // 保留原排序作為 fallback
      limit: 50, // 限制結果數量防止大量資料返回
      raw: false,
      nest: true
    })

    const ideaResults = ideas.map(idea => idea.toJSON())

    // 如果沒有結果，直接返回空陣列
    if (ideaResults.length === 0) {
      return ideaResults
    }

    // 批量獲取統計數據並計算熱門度
    const ideaIds = ideaResults.map(idea => idea.id)
    let sortedIdeas = ideaResults

    try {
      // 並行查詢收藏數和瀏覽數統計
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

      // 整合統計數據並計算熱門度
      const ideasWithHotness = ideaServices.combineStatsAndCalculateHotness(
        ideaResults,
        favoriteStats,
        viewStats
      )

      // 按熱門度排序（熱門度相同時按創建時間排序）
      sortedIdeas = ideasWithHotness.sort((a, b) => {
        if (b.hotScore === a.hotScore) {
          return new Date(b.createdAt) - new Date(a.createdAt)
        }
        return b.hotScore - a.hotScore
      })
    } catch (error) {
      // 如果統計查詢失敗，記錄錯誤但不影響頁面顯示
      console.error('Failed to calculate hotness scores:', error.message)
      // 使用原始的時間排序作為 fallback
      sortedIdeas = ideaResults
    }

    // 如果有用戶ID，批量檢查收藏狀態
    if (userId) {
      const favoriteRecords = await Favorite.findAll({
        where: {
          userId,
          ideaId: { [Op.in]: ideaIds }
        },
        attributes: ['ideaId']
      })

      const favoritedIdeaIds = new Set(favoriteRecords.map(f => f.ideaId))

      // 為每個想法添加收藏狀態
      sortedIdeas.forEach(idea => {
        idea.isFavorited = favoritedIdeaIds.has(idea.id)
      })
    } else {
      // 如果沒有用戶ID，設置為未收藏
      sortedIdeas.forEach(idea => {
        idea.isFavorited = false
      })
    }

    return sortedIdeas
  },

  // 輔助函數：整合統計數據並計算熱門度
  combineStatsAndCalculateHotness: (ideas, favoriteStats, viewStats) => {
    // 建立統計數據快速查找 Map
    const favoriteMap = new Map(favoriteStats.map(stat => [stat.ideaId, parseInt(stat.count) || 0]))
    const viewMap = new Map(viewStats.map(stat => [stat.ideaId, parseInt(stat.count) || 0]))

    // 為每個 idea 添加統計數據並計算熱門度
    return ideas.map(idea => {
      const favoriteCount = favoriteMap.get(idea.id) || 0
      const viewCount = viewMap.get(idea.id) || 0

      const hotScore = hotnessServices.calculateHotScore(
        idea,
        favoriteCount,
        viewCount
      )

      return {
        ...idea,
        favoriteCount,
        viewCount,
        hotScore
      }
    })
  },
  getIdeaByShareLink: async (shareLink, userId = null) => {
    const idea = await Idea.findOne({
      where: { shareLink },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      raw: false,
      nest: true
    })
    if (!idea) throw new Error('Idea not found')

    const ideaData = idea.toJSON()

    // Add favorite status if userId is provided
    if (userId) {
      const favorite = await Favorite.findOne({
        where: { userId, ideaId: idea.id }
      })
      ideaData.isFavorited = !!favorite
    } else {
      ideaData.isFavorited = false
    }

    return ideaData
  },

  // Tag 相關 service
  createOrFindTags: async (tagNames) => {
    if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
      return []
    }

    // 限制最多 3 個標籤
    const limitedTags = tagNames.slice(0, 3)

    // 清理和驗證標籤名稱
    const cleanTagNames = limitedTags
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0 && name.length <= 20)
      .filter((name, index, arr) => arr.indexOf(name) === index) // 去重複
    if (cleanTagNames.length === 0) {
      return []
    }

    // 使用 findOrCreate 來取得或建立標籤
    const tagPromises = cleanTagNames.map(name =>
      Tag.findOrCreate({
        where: { name },
        defaults: { name }
      })
    )

    const tagResults = await Promise.all(tagPromises)
    return tagResults.map(([tag]) => tag) // 取得標籤物件 (忽略 created 布林值)
  },

  associateTagsWithIdea: async (idea, tagNames) => {
    // bind tags to idea
    if (!tagNames || tagNames.length === 0) {
      return
    }

    // 建立或取得標籤
    const tags = await ideaServices.createOrFindTags(tagNames)

    // 建立關聯
    if (tags.length > 0) {
      await idea.setTags(tags)
    }
  },

  cleanupOrphanedTags: async () => {
    // 清理沒有任何 idea 關聯的孤立標籤
    const { Op } = require('sequelize')

    const orphanedTags = await Tag.findAll({
      include: [{
        model: Idea,
        as: 'ideas',
        required: false // 使用 LEFT JOIN，保留沒有關聯的記錄
      }],
      where: {
        '$ideas.id$': null
      }
    })

    if (orphanedTags.length > 0) {
      const orphanedIds = orphanedTags.map(tag => tag.id)
      await Tag.destroy({
        where: {
          id: { [Op.in]: orphanedIds }
        }
      })
    }

    return orphanedTags.length
  },

  getPopularTags: async (limit = 8) => {
    const { Sequelize } = require('sequelize')

    // 使用原生 SQL 查詢統計熱門標籤
    const query = `
      SELECT 
        t.name,
        COUNT(it.tag_id) AS count
      FROM Tags AS t
      INNER JOIN IdeaTags AS it ON t.id = it.tag_id
      INNER JOIN Ideas AS i ON it.idea_id = i.id  
      WHERE i.is_public = 1
      GROUP BY t.id, t.name
      ORDER BY count DESC
      LIMIT ?
    `

    const results = await Tag.sequelize.query(query, {
      replacements: [limit],  // replace ? in SQL query by order
      type: Sequelize.QueryTypes.SELECT
    })

    return results
  },

  // Favorites 相關服務
  addFavorite: async (userId, ideaId) => {
    // 檢查想法是否存在且為公開
    const idea = await Idea.findOne({
      where: {
        id: ideaId,
        isPublic: true
      }
    })

    if (!idea) {
      throw new Error('Idea not found or not public')
    }

    // 檢查用戶是否已收藏（避免重複）
    const existingFavorite = await Favorite.findOne({
      where: { userId, ideaId }
    })

    if (existingFavorite) {
      throw new Error('Already favorited')
    }

    // 建立收藏記錄
    const favorite = await Favorite.create({ userId, ideaId })

    // 即時更新該想法的熱門度分數
    try {
      await hotnessServices.updateSingleIdeaHotness(ideaId)
    } catch (error) {
      console.error(`Failed to update hotness score after favorite add for idea ${ideaId}:`, error.message)
    }

    return favorite
  },

  removeFavorite: async (userId, ideaId) => {
    const favorite = await Favorite.findOne({
      where: { userId, ideaId }
    })

    if (!favorite) {
      throw new Error('Favorite not found')
    }

    await favorite.destroy()

    // 即時更新該想法的熱門度分數
    try {
      await hotnessServices.updateSingleIdeaHotness(ideaId)
    } catch (error) {
      console.error(`Failed to update hotness score after favorite remove for idea ${ideaId}:`, error.message)
    }

    return { success: true }
  },

  getUserFavorites: async (userId, options = {}) => {
    const { limit = 50, offset = 0 } = options

    const user = await User.findByPk(userId)
    if (!user) {
      throw new Error('User not found')
    }

    // 透過多對多關係查詢用戶收藏的想法
    const favoriteIdeas = await user.getFavoriteIdeas({
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      through: {
        attributes: ['createdAt'], // 包含收藏時間
        as: 'favoriteInfo'
      },
      order: [[{ model: Favorite, as: 'favoriteInfo' }, 'createdAt', 'DESC']],
      limit,
      offset
    })

    return favoriteIdeas.map(idea => {
      const ideaJson = idea.toJSON()
      // 將收藏時間移到頂層方便存取
      ideaJson.favoritedAt = ideaJson.favoriteInfo?.createdAt
      delete ideaJson.favoriteInfo
      return ideaJson
    })
  },

  checkIfFavorited: async (userId, ideaId) => {
    if (!userId) return false

    const favorite = await Favorite.findOne({
      where: { userId, ideaId }
    })

    return !!favorite
  },

  /**
   * 分頁獲取公開想法 (Cursor-based pagination)
   * @param {string} cursor - 分頁游標
   * @param {number} limit - 每頁數量
   * @param {string} searchQuery - 搜尋關鍵字
   * @param {number} userId - 用戶ID
   * @returns {Promise<Object>} { ideas, nextCursor, hasMore }
   */
  getPublicIdeasPaginated: async (cursor, limit = 20, searchQuery = '', userId = null) => {
    const { Op } = require('sequelize')
    const cursorUtils = require('../utils/cursor-utils')
    const sequelize = Idea.sequelize

    try {
      // 解碼游標
      let cursorData = null
      if (cursor) {
        cursorData = cursorUtils.decodeCursor(cursor)
        if (!cursorData) {
          throw new Error('Invalid cursor format')
        }
      }

      // 基本查詢條件：只要公開的想法
      let whereCondition = { isPublic: true }

      // 處理搜尋條件（複用現有邏輯）
      if (searchQuery && searchQuery.trim()) {
        const safeQuery = ideaServices.safeSearch(searchQuery.trim())
        if (safeQuery) {
          const searchConditions = await ideaServices.buildSearchConditions(safeQuery)
          whereCondition = { ...whereCondition, ...searchConditions }
        }
      }

      // 加入游標條件
      if (cursorData) {
        const cursorCondition = cursorUtils.buildWhereCondition(cursorData, Op)
        whereCondition = { ...whereCondition, ...cursorCondition }
      }

      // 執行查詢（多取一筆來檢查是否還有更多）
      const ideas = await Idea.findAll({
        where: whereCondition,
        include: [
          {
            model: User,
            as: 'User',
            attributes: ['id', 'name', 'avatar']
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [
          ['hotnessScore', 'DESC'],  // 按熱門度排序
          ['createdAt', 'DESC'],     // 相同熱度時按時間排序
          ['id', 'DESC']             // 確保排序唯一性
        ],
        limit: limit + 1, // 多取一筆檢查是否還有更多
        raw: false,
        nest: true
      })

      // 檢查是否還有更多資料
      const hasMore = ideas.length > limit
      const resultIdeas = hasMore ? ideas.slice(0, limit) : ideas

      // 轉換資料格式
      const ideaResults = resultIdeas.map(idea => idea.toJSON())

      // 如果有結果，獲取統計數據
      let ideasWithStats = ideaResults
      if (ideaResults.length > 0) {
        const ideaIds = ideaResults.map(idea => idea.id)

        // 並行查詢收藏數統計
        const favoriteStats = await Favorite.findAll({
          where: { ideaId: { [Op.in]: ideaIds } },
          attributes: [
            'ideaId',
            [sequelize.fn('COUNT', sequelize.col('id')), 'count']
          ],
          group: ['ideaId'],
          raw: true
        })

        // 建立收藏數映射
        const favoriteMap = new Map(
          favoriteStats.map(stat => [stat.ideaId, parseInt(stat.count) || 0])
        )

        // 為每個想法添加統計數據
        ideasWithStats = ideaResults.map(idea => ({
          ...idea,
          favoriteCount: favoriteMap.get(idea.id) || 0
        }))
      }

      // 如果有用戶ID，檢查收藏狀態
      if (userId && ideasWithStats.length > 0) {
        const ideaIds = ideasWithStats.map(idea => idea.id)
        const favoriteRecords = await Favorite.findAll({
          where: {
            userId,
            ideaId: { [Op.in]: ideaIds }
          },
          attributes: ['ideaId']
        })

        const favoritedIdeaIds = new Set(favoriteRecords.map(f => f.ideaId))

        // 添加收藏狀態
        ideasWithStats.forEach(idea => {
          idea.isFavorited = favoritedIdeaIds.has(idea.id)
        })
      } else {
        // 未登入用戶設為未收藏
        ideasWithStats.forEach(idea => {
          idea.isFavorited = false
        })
      }

      // 生成下一頁游標
      let nextCursor = null
      if (hasMore && resultIdeas.length > 0) {
        const lastIdea = resultIdeas[resultIdeas.length - 1]
        nextCursor = cursorUtils.encodeCursor(
          lastIdea.hotnessScore,
          lastIdea.createdAt,
          lastIdea.id
        )
      }

      return {
        ideas: ideasWithStats,
        nextCursor,
        hasMore
      }
    } catch (error) {
      console.error('Error in getPublicIdeasPaginated:', error.message)
      throw error
    }
  },

  /**
   * 安全搜尋函數（從 getPublicIdeas 提取出來）
   * @param {string} query - 搜尋字串
   * @returns {string|null} 安全的搜尋字串
   */
  safeSearch: (query) => {
    if (!query || typeof query !== 'string') {
      return null
    }

    const trimmed = query.trim()
    if (trimmed.length < 1 || trimmed.length > 50) {
      return null
    }

    // 轉義 LIKE 特殊字符：% _ \
    return trimmed.replace(/[%_\\]/g, (match) => `\\${match}`)
  },

  /**
   * 建立搜尋條件（從 getPublicIdeas 提取出來）
   * @param {string} safeQuery - 安全的搜尋字串
   * @returns {Promise<Object>} 搜尋條件物件
   */
  buildSearchConditions: async (safeQuery) => {
    const { Op } = require('sequelize')

    const orConditions = [
      { title: { [Op.like]: `%${safeQuery}%` } },
      { content: { [Op.like]: `%${safeQuery}%` } }
    ]

    // 搜尋匹配的用戶名稱
    const matchingUsers = await User.findAll({
      where: { name: { [Op.like]: `%${safeQuery}%` } },
      attributes: ['id']
    })

    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map(user => user.id)
      orConditions.push({ userId: { [Op.in]: userIds } })
    }

    // 搜尋匹配的標籤
    const matchingTags = await Tag.findAll({
      where: { name: { [Op.like]: `%${safeQuery}%` } },
      attributes: ['id']
    })

    if (matchingTags.length > 0) {
      const tagIds = matchingTags.map(tag => tag.id)
      const { IdeaTag } = require('../models')
      const ideaTagRelations = await IdeaTag.findAll({
        where: { tagId: { [Op.in]: tagIds } },
        attributes: ['ideaId']
      })

      if (ideaTagRelations.length > 0) {
        const ideaIds = ideaTagRelations.map(relation => relation.ideaId)
        orConditions.push({ id: { [Op.in]: ideaIds } })
      }
    }

    return {
      [Op.or]: orConditions
    }
  }
}

module.exports = ideaServices
