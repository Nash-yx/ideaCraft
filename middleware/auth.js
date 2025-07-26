const authMiddleware = {
  // Middleware to ensure user is authenticated
  requireAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Please log in to access this page')
    res.redirect('/login')
  },

  // Middleware to redirect authenticated users
  redirectIfAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  },

  getUser: (req, res, next) => {
    return req.user || null
  }
}

module.exports = authMiddleware
