const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../config/passport')

router.get('/signup', userController.signupPage)
router.post('/signup', userController.signup)
router.get('/login', userController.loginPage)
router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: true
}), userController.login)

// Google 認證
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login',
  failureFlash: true
}), userController.login)

// GitHub 認證
router.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }))
router.get('/auth/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/login',
    failureFlash: true
  }), userController.login)

router.get('/logout', userController.logout)

router.get('/', (req, res) => {
  res.json({ message: 'IdeaCraft API is running' })
})

module.exports = router
