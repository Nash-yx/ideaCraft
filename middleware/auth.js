const authMiddleware = {
  // Middleware to ensure user is authenticated
  requireAuth: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next()
    }

    // 檢查是否為 AJAX 請求
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                   (req.headers.accept && req.headers.accept.includes('application/json'))

    if (isAjax) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
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
