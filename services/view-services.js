const { View, Idea } = require('../models')
const { Op } = require('sequelize')

const viewServices = {
  recordView: async (userId, ideaId) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const existingView = await View.findOne({
        where: {
          userId,
          ideaId,
          createdAt: {
            [Op.gte]: twentyFourHoursAgo
          }
        }
      })

      if (existingView) {
        return { success: false, message: 'View already recorded within 24 hours' }
      }

      const newView = await View.create({
        userId,
        ideaId
      })

      return { success: true, view: newView }
    } catch (error) {
      throw new Error(`Failed to record view: ${error.message}`)
    }
  },

  getIdeaViewCount: async (ideaId) => {
    try {
      const count = await View.count({
        where: { ideaId }
      })

      return count
    } catch (error) {
      throw new Error(`Failed to get view count: ${error.message}`)
    }
  },

  getUserViewHistory: async (userId, limit = 10) => {
    try {
      const views = await View.findAll({
        where: { userId },
        include: [{
          model: Idea,
          as: 'idea',
          attributes: ['id', 'title']
        }],
        order: [['createdAt', 'DESC']],
        limit
      })

      return views
    } catch (error) {
      throw new Error(`Failed to get user view history: ${error.message}`)
    }
  }
}

module.exports = viewServices
