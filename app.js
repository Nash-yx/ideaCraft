const dotenv = require('dotenv')
// 載入環境變數
dotenv.config()

const express = require('express')
const path = require('path')
const { engine } = require('express-handlebars')
const morgan = require('morgan')
const methodOverride = require('method-override')
const helmet = require('helmet')

const router = require('./routes')
const logger = require('./utils/logger') // 載入日誌配置
const passport = require('./config/passport')
const session = require('express-session')
const flash = require('connect-flash')
const { generalErrorHandler } = require('./middleware/error-handler')
const { getUser } = require('./middleware/auth')
const csrfMiddleware = require('./middleware/csrf')
const { globalLimiter } = require('./middleware/rate-limit')
const handlebarsHelpers = require('./utils/handlebars-helpers')

const app = express()
const PORT = process.env.PORT || 3000

// 安全性中間件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"]
    }
  }
}))

// Rate limiting
app.use(globalLimiter)

// 解析請求體
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 配置 session
app.use(session({
  secret: process.env.SESSION_SECRET || 'SecretOfSecrets',
  name: 'sessionId', // 更改預設的 session cookie 名稱，隱藏技術細節
  resave: false, // 不強制重新保存未修改的 session
  saveUninitialized: true, // 保存未初始化的 session (CSRF 需要)
  cookie: {
    secure: process.env.NODE_ENV === 'production', // 生產環境強制 HTTPS
    httpOnly: true, // 防止 XSS 攻擊，JavaScript 無法訪問 cookie
    maxAge: 24 * 60 * 60 * 1000, // 24 小時過期
    sameSite: 'lax' // CSRF 防護，允許正常的導航但阻止跨站請求
  },
  rolling: true // 每次請求都刷新過期時間
}))

// 初始化 Passport
app.use(passport.initialize())
app.use(passport.session())

// 設置 flash 訊息
app.use(flash())

app.use(methodOverride('_method'))

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'views/layouts'),
  partialsDir: path.join(__dirname, 'views/partials'),
  helpers: handlebarsHelpers
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

// 靜態文件服務
app.use(express.static(path.join(__dirname, 'public')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// HTTP 請求日誌
app.use(morgan('dev', { stream: logger.stream }))

// CSRF token 中間件
app.use(csrfMiddleware.addToken)

// 全局變數設置
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.user = getUser(req)
  next()
})

// CSRF 驗證中間件
app.use(csrfMiddleware.verifyToken)

app.use(router)

app.use(generalErrorHandler)

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`)
})

module.exports = app
