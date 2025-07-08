const logger = require('../utils/logger')

/**
 * 集中式錯誤處理中間件
 */
const generalErrorHandler = (err, req, res, next) => {
  if (err instanceof Error) {
    req.flash('error_msg', `${err.name}: ${err.message}`)
  } else {
    req.flash('error_msg', `${err}`)
  }
  // 重定向到上一頁
  const referer = req.get('Referrer')
  res.redirect(referer)
}

const errorHandler = (err, req, res, next) => {
  // 日誌記錄錯誤
  logger.error(`${err.name}: ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    body: req.body,
    query: req.query
  })

  // 確定錯誤狀態碼
  const statusCode = err.statusCode || 500

  // 回應客戶端
  res.status(statusCode)

  // 根據請求類型返回不同格式
  if (req.accepts('html')) {
    // HTML response
    res.render('error', {
      message: process.env.NODE_ENV === 'production' ? '服務器錯誤' : err.message,
      error: process.env.NODE_ENV === 'production' ? {} : err,
      stack: process.env.NODE_ENV === 'production' ? '' : err.stack
    })
  } else {
    // API response
    res.json({
      success: false,
      error: {
        message: process.env.NODE_ENV === 'production' ? '服務器錯誤' : err.message,
        code: err.code || 'INTERNAL_SERVER_ERROR'
      }
    })
  }
}

/**
 * 404 錯誤處理
 */
const notFoundHandler = (req, res, next) => {
  const err = new Error('找不到資源')
  err.statusCode = 404
  err.code = 'NOT_FOUND'
  next(err)
}

module.exports = {
  generalErrorHandler,
  errorHandler,
  notFoundHandler
}
