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
  }
}

module.exports = hotnessServices
