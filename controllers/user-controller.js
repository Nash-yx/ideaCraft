const userServices = require('../services/user-services')
const userController = {
  signupPage: (req, res) => {
    res.render('signup')
  },
  signup: async (req, res, next) => {
    try {
      const user = await userServices.signup(req)
      req.flash('success_msg', 'Signup successfully')
      return res.redirect('/login')
    } catch (error) {
      next(error)
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
