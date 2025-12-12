const express = require('express')
const router = express.Router()
const userController = require('../controllers/user-controller')
const passport = require('../config/passport')
const { requireAuth } = require('../middleware/auth')
const { upload } = require('../middleware/multer')
const { authLimiter, createContentLimiter } = require('../middleware/rate-limit')
const csrfMiddleware = require('../middleware/csrf')
const ideaController = require('../controllers/idea-controller')
const aiProjectController = require('../controllers/ai-project-controller')

router.get('/signup', userController.signupPage)
router.post('/signup', authLimiter, userController.signup)
router.get('/login', userController.loginPage)
router.post('/login', authLimiter, passport.authenticate('local', {
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
router.put('/users/:id', requireAuth, upload.single('avatar'), csrfMiddleware.verifyTokenManually, userController.putUser)

router.get('/author/:id', requireAuth, userController.getAuthor)

router.get('/ideas', requireAuth, ideaController.getIdeas)
router.get('/ideas/new', requireAuth, ideaController.getNewIdeaPage)
router.post('/ideas', requireAuth, createContentLimiter, ideaController.postIdea)
router.get('/ideas/:id', requireAuth, ideaController.getIdea)
router.get('/ideas/:id/edit', requireAuth, ideaController.getEditIdeaPage)
router.put('/ideas/:id', requireAuth, createContentLimiter, ideaController.updateIdea)
router.delete('/ideas/:id', requireAuth, ideaController.deleteIdea)

// Favorites 路由
router.post('/ideas/:id/favorite', requireAuth, ideaController.addFavorite)
router.delete('/ideas/:id/favorite', requireAuth, ideaController.removeFavorite)
router.get('/users/:id/favorites', requireAuth, ideaController.getUserFavorites)

router.get('/explore', requireAuth, ideaController.getExplorePage)

// AI Projects 路由
router.get('/ai-projects', requireAuth, aiProjectController.getCreatePage)
router.post('/ai-projects', requireAuth, createContentLimiter, aiProjectController.postProject)

// API 端點：分頁探索想法
router.get('/api/explore/ideas', requireAuth, ideaController.getExploreIdeasAPI)

router.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/ideas')
  }
  res.render('home', { activePage: 'ideas' })
})

module.exports = router
