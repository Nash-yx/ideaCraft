const multer = require('multer')
const fs = require('fs')
const path = require('path')

// 檔案處理器 - 基於你提供的 code snippet 概念
const localFileHandler = (file, userId) => {
  return new Promise((resolve, reject) => {
    if (!file) return resolve(null)

    // 確保 uploads/avatars 資料夾存在
    const uploadsDir = 'uploads/avatars'
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // 清理該用戶的所有舊頭像檔案
    const cleanupOldAvatars = async () => {
      try {
        const files = await fs.promises.readdir(uploadsDir)
        const userFiles = files.filter(f => f.startsWith(`user-${userId}.`))
        await Promise.all(userFiles.map(f => fs.promises.unlink(path.join(uploadsDir, f))))
      } catch (err) {
        // 忽略清理錯誤，繼續上傳新檔案
      }
    }

    // 使用固定檔名策略 - 每個用戶一個檔案，自動覆蓋
    const ext = path.extname(file.originalname).toLowerCase()
    const fileName = `uploads/avatars/user-${userId}${ext}`

    // 先清理舊檔案，再上傳新檔案
    cleanupOldAvatars()
      .then(() => fs.promises.readFile(file.path))
      .then(data => fs.promises.writeFile(fileName, data))
      .then(() => fs.promises.unlink(file.path)) // 清理暫存檔案
      .then(() => resolve(`/${fileName}`))
      .catch(err => reject(err))
  })
}

// Multer 配置 - 暫存到 temp 資料夾
const upload = multer({
  dest: 'temp/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB 限制
  },
  fileFilter: (req, file, cb) => {
    // 只允許圖片檔案
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

module.exports = { upload, localFileHandler }
