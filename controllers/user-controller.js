const { User } = require('../models')
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
    req.logout((err) => {
      if (err) {
        return next(err)
      }
      return res.redirect('/login')
    })
  },
  getUser: async (req, res) => {
    const id = req.user.id
    const user = await User.findByPk(id, { raw: true })
    return res.render('profile', { user, activePage: 'profile' })
  },
  putUser: async (req, res, next) => {
    try {
      const user = await userServices.putUser(req)
      req.flash('success_msg', 'User profile successfully edited')
      return res.redirect(`/users/${req.params.id}`)
    } catch (err) {
      next(err)
    }
  },
  getAuthor: async (req, res) => {
    const id = req.params.id
    const user = await User.findByPk(id, { raw: true })
    if (!user) {
      return res.status(404).render('error', { message: 'User not found' })
    }
    return res.render('author', { user, activePage: 'explore' })
  }
}

module.exports = userController
