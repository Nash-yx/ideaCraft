const dotenv = require('dotenv')
// 載入環境變數
dotenv.config()

const express = require('express')
const path = require('path')
const { engine } = require('express-handlebars')
const morgan = require('morgan')
const methodOverride = require('method-override')

const router = require('./routes')
const logger = require('./utils/logger') // 載入日誌配置
const passport = require('./config/passport')
const session = require('express-session')
const flash = require('connect-flash')
const { generalErrorHandler, errorHandler, notFoundHandler } = require('./middleware/error-handler')
const { getUser } = require('./middleware/auth')
const handlebarsHelpers = require('./utils/handlebars-helpers')

const app = express()
const PORT = process.env.PORT || 3000

// 解析請求體
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 配置 session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
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

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.warning_msg = req.flash('warning_msg')
  res.locals.user = getUser(req)
  next()
})

app.use(router)

app.use(generalErrorHandler)

// 404 處理
// app.use(notFoundHandler)

// 錯誤處理中間件
// app.use(errorHandler)

// 啟動服務器
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`)
})

module.exports = app
