const { User, Idea, Favorite, View } = require('../models')

const profileServices = {
  getUserStats: async (userId) => {
    try {
      const { Op } = require('sequelize')

      const userIdeas = await Idea.findAll({
        attributes: ['id'],
        where: {
          userId,
          isPublic: true
        },
        raw: true
      })

      const ideaIds = userIdeas.map(idea => idea.id)

      if (ideaIds.length === 0) {
        return {
          totalViews: 0,
          totalFavorites: 0,
          ideasCount: 0
        }
      }

      const [totalViews, totalFavorites] = await Promise.all([
        View.count({
          where: { ideaId: { [Op.in]: ideaIds } }
        }),
        Favorite.count({
          where: { ideaId: { [Op.in]: ideaIds } }
        })
      ])

      return {
        totalViews: totalViews || 0,
        totalFavorites: totalFavorites || 0,
        ideasCount: ideaIds.length
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
      // 返回默認值，避免頁面崩潰
      return {
        totalViews: 0,
        totalFavorites: 0,
        ideasCount: 0
      }
    }
  },
  getTopIdeas: async (userId, limit = 3) => {
    try {
      const ideas = await Idea.findAll({
        where: {
          userId,
          isPublic: true
        },
        attributes: [
          'id',
          'title',
          'content',
          'hotness_score',
          'createdAt',
          'shareLink'
        ],
        include: [{
          model: User,
          attributes: ['id', 'name']
        }],
        order: [
          ['hotness_score', 'DESC'], // 按熱門度排序
          ['createdAt', 'DESC']       // 熱門度相同時按時間排序
        ],
        limit,
        raw: false,
        nest: true
      })

      // 處理標籤信息（簡化版本，避免複雜的關聯查詢）
      const ideasWithBasicInfo = ideas.map(idea => {
        const ideaData = idea.toJSON()

        // 截斷標題和內容以適應顯示
        ideaData.truncatedTitle = ideaData.title.length > 50
          ? ideaData.title.substring(0, 50) + '...'
          : ideaData.title

        ideaData.truncatedContent = ideaData.content.length > 100
          ? ideaData.content.substring(0, 100) + '...'
          : ideaData.content

        return ideaData
      })

      return ideasWithBasicInfo
    } catch (error) {
      console.error('Error fetching top ideas:', error)
      // 返回空數組，避免頁面崩潰
      return []
    }
  },
  getUserProfileData: async (userId) => {
    try {
      // 並行獲取統計數據和熱門ideas
      const [stats, topIdeas] = await Promise.all([
        profileServices.getUserStats(userId),
        profileServices.getTopIdeas(userId, 3)
      ])

      return {
        stats,
        topIdeas
      }
    } catch (error) {
      console.error('Error fetching user profile data:', error)
      // 返回默認數據
      return {
        stats: {
          totalViews: 0,
          totalFavorites: 0,
          ideasCount: 0
        },
        topIdeas: []
      }
    }
  }
}

module.exports = profileServices
