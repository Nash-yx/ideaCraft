const moment = require('moment')

const handlebarsHelpers = {
  // Format date helper
  formatDate: (date) => {
    if (!date) return 'N/A'
    return moment(date).format('MMM DD, YYYY')
  },

  // Time ago helper
  timeAgo: (date) => {
    if (!date) return 'N/A'
    return moment(date).fromNow()
  },

  // Truncate text helper
  truncate: (text, length) => {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
  },

  // Equality helper
  eq: (a, b) => {
    return a === b
  },

  // Conditional helper
  ifCond: function (conditional, options) {
    if (conditional) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },

  // Default avatar helper
  defaultAvatar: (avatar) => {
    return avatar && avatar.trim() !== '' ? avatar : '/img/default-avatar.svg'
  },

  // Get border color based on index
  getBorderColor: (index) => {
    const colors = ['purple', 'green', 'red', 'blue', 'orange', 'teal', 'pink', 'indigo']
    return colors[index % colors.length]
  },

  // Count public ideas
  getPublicCount: (ideas) => {
    if (!ideas || !Array.isArray(ideas)) return 0
    return ideas.filter(idea => idea.isPublic || idea.is_public).length
  },

  // Count private ideas
  getPrivateCount: (ideas) => {
    if (!ideas || !Array.isArray(ideas)) return 0
    return ideas.filter(idea => !idea.isPublic && !idea.is_public).length
  },

  // Count ideas created this week
  getThisWeekCount: (ideas) => {
    if (!ideas || !Array.isArray(ideas)) return 0
    const oneWeekAgo = moment().subtract(7, 'days')
    return ideas.filter(idea => {
      const createdAt = idea.createdAt || idea.created_at
      return moment(createdAt).isAfter(oneWeekAgo)
    }).length
  },

  // Get trend data comparing this week vs last week
  getTrendData: (ideas, type = 'total') => {
    if (!ideas || !Array.isArray(ideas) || ideas.length === 0) return null

    const now = moment()
    const thisWeekStart = now.clone().subtract(7, 'days')
    const lastWeekStart = now.clone().subtract(14, 'days')

    let thisWeekIdeas, lastWeekIdeas

    if (type === 'total') {
      thisWeekIdeas = ideas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isAfter(thisWeekStart)
      })
      lastWeekIdeas = ideas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isBetween(lastWeekStart, thisWeekStart)
      })
    } else if (type === 'public') {
      const publicIdeas = ideas.filter(idea => idea.isPublic || idea.is_public)
      thisWeekIdeas = publicIdeas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isAfter(thisWeekStart)
      })
      lastWeekIdeas = publicIdeas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isBetween(lastWeekStart, thisWeekStart)
      })
    } else if (type === 'private') {
      const privateIdeas = ideas.filter(idea => !idea.isPublic && !idea.is_public)
      thisWeekIdeas = privateIdeas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isAfter(thisWeekStart)
      })
      lastWeekIdeas = privateIdeas.filter(idea => {
        const createdAt = moment(idea.createdAt || idea.created_at)
        return createdAt.isBetween(lastWeekStart, thisWeekStart)
      })
    }

    const thisWeekCount = thisWeekIdeas.length
    const lastWeekCount = lastWeekIdeas.length
    const difference = thisWeekCount - lastWeekCount

    if (difference > 0) {
      return { type: 'positive', value: difference, icon: 'fa-arrow-up' }
    } else if (difference < 0) {
      return { type: 'negative', value: Math.abs(difference), icon: 'fa-arrow-down' }
    } else if (thisWeekCount > 0) {
      return { type: 'neutral', value: thisWeekCount, icon: 'fa-minus' }
    }

    return null
  },

  // Count unique authors in ideas
  getUniqueAuthors: (ideas) => {
    if (!ideas || !Array.isArray(ideas)) return 0
    const uniqueUserIds = new Set()
    ideas.forEach(idea => {
      if (idea.User && idea.User.id) {
        uniqueUserIds.add(idea.User.id)
      } else if (idea.userId) {
        uniqueUserIds.add(idea.userId)
      }
    })
    return uniqueUserIds.size
  },

  // Get tag color based on index
  getTagColor: (index) => {
    const colors = ['tag-blue', 'tag-orange', 'tag-green', 'tag-purple', 'tag-pink']
    return colors[index % colors.length]
  }
}

module.exports = handlebarsHelpers
