const userServices = require('../services/user-services')
const userController = {
  signupPage: (req, res) => {
    res.render('signup')
  },
  signup: async (req, res, next) => {
    try {
      await userServices.signup(req)
      req.flash('success_msg', 'Sign up successfully')
      return res.redirect('/')
    } catch (err) {
      next(err)
    }
  },
  loginPage: (req, res) => {
    res.render('login')
  },
  login: (req, res) => {
    req.flash('success_msg', 'Login successfully')
    return res.redirect('/')
  }
}

module.exports = userController
