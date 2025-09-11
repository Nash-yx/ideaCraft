const csrf = require('csrf')
const tokens = csrf()

const csrfMiddleware = {
  // 生成 CSRF token 並添加到 locals
  addToken: (req, res, next) => {
    if (!req.session.csrfSecret) {
      req.session.csrfSecret = tokens.secretSync()
    }

    const token = tokens.create(req.session.csrfSecret)
    res.locals.csrfToken = token
    next()
  },

  // 驗證 CSRF token
  verifyToken: (req, res, next) => {
    // 跳過 GET, HEAD, OPTIONS 請求
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next()
    }

    if (!req.session.csrfSecret) {
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                     (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(403).json({ error: 'CSRF token missing' })
      } else {
        req.flash('error_msg', 'Security token missing. Please try again.')
        return res.redirect('/login')
      }
    }

    // 檢查是否為 multipart 表單
    const contentType = req.get('Content-Type') || ''
    const isMultipart = contentType.includes('multipart/form-data')

    // 對於 multipart 表單，跳過全局驗證，讓路由處理
    if (isMultipart) {
      req._skipCSRFVerification = false // 標記需要稍後驗證
      return next()
    }

    const token = (req.body && req.body._csrf) || req.headers['x-csrf-token']

    if (!token || !tokens.verify(req.session.csrfSecret, token)) {
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' ||
                     (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(403).json({ error: 'Invalid CSRF token' })
      } else {
        req.flash('error_msg', 'Security token invalid. Please try again.')
        return res.redirect('/login')
      }
    }

    next()
  },

  // 手動驗證 CSRF token（用於 multer 路由）
  verifyTokenManually: (req, res, next) => {
    if (!req.session.csrfSecret) {
      req.flash('error_msg', 'Security token missing. Please try again.')
      return res.redirect('/login')
    }

    const token = (req.body && req.body._csrf) || req.headers['x-csrf-token']

    if (!token || !tokens.verify(req.session.csrfSecret, token)) {
      req.flash('error_msg', 'Security token invalid. Please try again.')
      return res.redirect('/login')
    }

    next()
  }
}

module.exports = csrfMiddleware
