const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { User } = require('../models')
const bcrypt = require('bcrypt')

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({
          where: { email },
          raw: true
        })
        if (!user) return done(null, false, { message: 'Email or password is incorrect' })

        const isPasswordMatch = await bcrypt.compare(password, user.password)
        if (!isPasswordMatch) { return done(null, false, { message: 'Email or password is incorrect' }) }

        return done(null, user)
      } catch (error) {
        return done(error)
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
