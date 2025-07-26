const { User } = require('../models')
const bcrypt = require('bcryptjs')
const { localFileHandler } = require('../middleware/multer')

const userServices = {
  signup: async (req) => {
    const { name, email, password, confirmPassword } = req.body
    if (password !== confirmPassword) {
      throw new Error('Password and confirm password do not match')
    }
    const user = await User.findOne({ where: { email } })
    if (user) throw new Error('Email already exists')
    const newUser = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10)
    })
    return newUser
  },
  putUser: async (req) => {
    const { name, role, bio, backgroundColor } = req.body
    const user = await User.findByPk(req.params.id)
    if (!user) throw new Error("User didn't exist!")

    // 處理頭像上傳
    let avatarPath = user.avatar // 保留原有的頭像
    if (req.file) {
      try {
        avatarPath = await localFileHandler(req.file, req.params.id)
      } catch (error) {
        throw new Error('Avatar upload failed: ' + error.message)
      }
    }

    // 準備更新資料
    const updateData = {
      name,
      role,
      bio,
      avatar: avatarPath
    }

    // 如果有提供背景顏色，則更新
    if (backgroundColor) {
      // 基本的 CSS gradient 格式驗證
      if (backgroundColor.includes('linear-gradient') || backgroundColor.includes('radial-gradient')) {
        updateData.backgroundColor = backgroundColor
      }
    }

    const updatedUser = await user.update(updateData)
    return updatedUser
  }
}

module.exports = userServices
