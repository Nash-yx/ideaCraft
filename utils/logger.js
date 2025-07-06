const winston = require('winston')
const path = require('path')
const fs = require('fs')

// 確保日誌目錄存在
const logDir = 'logs'
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

// 日誌格式定義
const { format, transports } = winston
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
)

// 創建日誌實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'design-platform' },
  transports: [
    // 錯誤日誌
    new transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // 應用日誌
    new transports.File({
      filename: path.join(logDir, 'app.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
})

// 開發環境下同時輸出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new transports.Console({
      format: format.combine(format.colorize(), format.simple())
    })
  )
}

// 創建 HTTP 請求日誌流
logger.stream = {
  write (message) {
    logger.info(message.trim())
  }
}

module.exports = logger
