const userServices = require('../services/user-services')
const userController = {
  signupPage: (req, res) => {
    res.render('signup', { layout: 'auth' })
  },
  signup: async (req, res, next) => {
    try {
      await userServices.signup(req)
      req.flash('success_msg', 'Sign up successfully')
      return res.redirect('/login')
    } catch (err) {
      next(err)
    }
  },
  loginPage: (req, res) => {
    res.render('login', { layout: 'auth' })
  },
  login: (req, res) => {
    req.flash('success_msg', 'Login successfully')
    return res.redirect('/')
  },
  logout: (req, res, next) => {
    req.flash('success_msg', 'Logout successfully')
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      return res.redirect('/login')
    })
  }
}

module.exports = userController
