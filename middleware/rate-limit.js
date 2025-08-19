const rateLimit = require('express-rate-limit')

// 全域 rate limiter - 相對寬鬆
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 1000, // 每個 IP 最多 1000 次請求
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // 返回 rate limit 資訊在 `RateLimit-*` headers
  legacyHeaders: false, // 禁用 `X-RateLimit-*` headers
})

// 嚴格的登入 rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 5, // 最多 5 次登入嘗試
  message: {
    error: 'Too many login attempts from this IP, please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功登入不計算在限制內
})

// API rate limiter - 中等限制
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: 200, // 每個 IP 最多 200 次 API 請求
  message: {
    error: 'Too many API requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// 創建/編輯內容的嚴格限制
const createContentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: 10, // 每分鐘最多創建 10 個 idea
  message: {
    error: 'Too many content creation requests, please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
})

module.exports = {
  globalLimiter,
  authLimiter,
  apiLimiter,
  createContentLimiter
}
