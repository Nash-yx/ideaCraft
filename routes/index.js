const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../config/passport')
const { requireAuth } = require('../middleware/auth')
const { upload } = require('../middleware/multer')
const ideaController = require('../controllers/idea-controller')

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

router.get('/users/:id', requireAuth, userController.getUser)
router.put('/users/:id', requireAuth, upload.single('avatar'), userController.putUser)

router.get('/ideas', requireAuth, ideaController.getIdeas)
router.get('/ideas/new', requireAuth, ideaController.getNewIdeaPage)
router.post('/ideas', requireAuth, ideaController.postIdea)
router.get('/ideas/:id', requireAuth, ideaController.getIdea)
router.get('/ideas/:id/edit', requireAuth, ideaController.getEditIdeaPage)
router.put('/ideas/:id', requireAuth, ideaController.updateIdea)
router.delete('/ideas/:id', requireAuth, ideaController.deleteIdea)

router.get('/explore', requireAuth, ideaController.getExplorePage)

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/ideas')
  }
  res.render('home', { activePage: 'ideas' })
})

module.exports = router
