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

  // Current year helper
  currentYear: () => {
    return new Date().getFullYear()
  },

  // Conditional helper
  ifCond: function (conditional, options) {
    if (conditional) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },

  // Unless helper
  unless: function (conditional, options) {
    if (!conditional) {
      return options.fn(this)
    } else {
      return options.inverse(this)
    }
  },

  // Each helper with index
  eachWithIndex: function (array, options) {
    let result = ''
    for (let i = 0; i < array.length; i++) {
      result += options.fn({
        ...array[i],
        index: i,
        first: i === 0,
        last: i === array.length - 1
      })
    }
    return result
  },

  // Default avatar helper
  defaultAvatar: (avatar) => {
    return avatar && avatar.trim() !== '' ? avatar : '/img/default-avatar.svg'
  }
}

module.exports = handlebarsHelpers
