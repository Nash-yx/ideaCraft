const passport = require('passport')
const LocalStrategy = require('passport-local')
const { User } = require('../models')
const bcrypt = require('bcryptjs')
const GoogleStrategy = require('passport-google-oauth20')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        console.log(req.body)
        const user = await User.findOne({
          where: { email },
          raw: true
        })
        if (!user) return done(null, false, req.flash('error_msg', 'Email or password is incorrect'))

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) return done(null, false, req.flash('error_msg', 'Email or password is incorrect'))

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        // 從 Google 資料中提取關鍵資訊
        console.log('profile:', profile)
        const { id, displayName, emails, photos } = profile
        const email = emails[0].value
        const profilePhoto = photos[0].value

        // 檢查用戶是否已存在
        let user = await User.findOne({
          where: { email }
        })

        if (!user) {
          // 如果用戶不存在，創建新用戶
          const randomPwd = Math.random().toString(36).slice(-8)
          const hashedPwd = await bcrypt.hash(randomPwd, 10)
          user = await User.create({
            name: displayName,
            email,
            password: hashedPwd,
            googleId: id,
            picture: profilePhoto
            // 根據需要設定其他欄位
          })
        } else if (!user.googleId) {
          // 如果用戶存在但沒有綁定 Google 帳號，則更新用戶資料
          await user.update({
            googleId: id,
            picture: user.picture || profilePhoto
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (userId, done) => {
  try {
    const user = await User.findByPk(userId)
    done(null, user.toJSON())
  } catch (error) {
    done(error)
  }
})

module.exports = passport
