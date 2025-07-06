const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')

router.get('/signup', userController.signupPage)
router.post('/signup', userController.signup)
router.get('/login', userController.loginPage)
router.post('/login', userController.login)

router.get('/', (req, res) => {
  res.json({ message: 'Image Gallery API is running' })
})

module.exports = router
