const ideaServices = require('../services/idea-services')
const viewServices = require('../services/view-services')

const ideaController = {
  getIdeas: async (req, res, next) => {
    try {
      const ideas = await ideaServices.getIdeas(req)
      return res.render('home', { ideas, activePage: 'ideas' })
    } catch (err) {
      next(err)
    }
  },
  postIdea: async (req, res, next) => {
    try {
      await ideaServices.postIdea(req)
      req.flash('success_msg', 'Idea created successfully')
      return res.redirect('/ideas')
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas/new')
    }
  },
  getIdea: async (req, res, next) => {
    try {
      const idea = await ideaServices.getIdea(req)
      const isOwner = idea.userId === req.user.id

      // 記錄瀏覽（非作者時才記錄）
      if (!isOwner) {
        try {
          await viewServices.recordView(req.user.id, idea.id)
        } catch (error) {
          console.error('Failed to record view:', error.message)
        }
      }

      return res.render('idea-detail', {
        idea,
        isOwner,
        activePage: 'ideas'
      })
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  },
  getNewIdeaPage: async (req, res, next) => {
    try {
      // Provide default values for create form
      const idea = {
        title: '',
        content: '',
        isPublic: false
      }
      return res.render('idea-create', {
        idea,
        isEdit: false,
        activePage: 'create'
      })
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  },
  getEditIdeaPage: async (req, res, next) => {
    try {
      const idea = await ideaServices.getIdea(req)
      return res.render('idea-edit', {
        idea,
        isEdit: true,
        activePage: 'ideas'
      })
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  },
  updateIdea: async (req, res, next) => {
    try {
      await ideaServices.updateIdea(req)
      req.flash('success_msg', 'Idea updated successfully')
      return res.redirect(`/ideas/${req.params.id}`)
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect(`/ideas/${req.params.id}/edit`)
    }
  },
  deleteIdea: async (req, res, next) => {
    try {
      await ideaServices.deleteIdea(req)

      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      // 統一設置 flash message
      req.flash('success_msg', 'Idea deleted successfully')

      if (isAjax) {
        return res.json({ success: true, message: 'Idea deleted successfully' })
      }

      return res.redirect('/ideas')
    } catch (err) {
      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(400).json({ success: false, message: err.message })
      }

      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  },
  getExplorePage: async (req, res, next) => {
    try {
      if (req.query.share) {
        const idea = await ideaServices.getIdeaByShareLink(req.query.share)
        return res.render('idea-detail', { idea, activePage: 'explore', isOwner: false })
      }

      // 獲取搜尋查詢參數
      const searchQuery = req.query.q || req.query.search || ''

      // 並行獲取 ideas 和熱門標籤資料
      const [ideas, popularTags] = await Promise.all([
        ideaServices.getPublicIdeas(searchQuery, req.user.id),
        ideaServices.getPopularTags(8)
      ])

      // 準備模板數據
      const templateData = {
        ideas,
        popularTags,
        activePage: 'explore',
        searchQuery: searchQuery.trim(),
        hasSearch: searchQuery.trim().length > 0,
        searchResultsCount: ideas.length
      }

      return res.render('explore', templateData)
    } catch (err) {
      next(err)
    }
  },

  // Favorites 相關控制器
  addFavorite: async (req, res, next) => {
    try {
      const { id: ideaId } = req.params
      const userId = req.user.id

      await ideaServices.addFavorite(userId, parseInt(ideaId))

      // 返回 JSON 供 AJAX 使用
      return res.json({
        success: true,
        favorited: true,
        message: 'Added to favorites'
      })
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
  },

  removeFavorite: async (req, res, next) => {
    try {
      const { id: ideaId } = req.params
      const userId = req.user.id

      await ideaServices.removeFavorite(userId, parseInt(ideaId))

      // 返回 JSON 供 AJAX 使用
      return res.json({
        success: true,
        favorited: false,
        message: 'Removed from favorites'
      })
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      })
    }
  },

  getUserFavorites: async (req, res, next) => {
    try {
      const { id: userId } = req.params
      const { limit, offset } = req.query

      // 檢查權限：只有本人可以查看自己的收藏
      if (parseInt(userId) !== req.user.id) {
        req.flash('error_msg', 'Access denied')
        return res.redirect('/ideas')
      }

      const favoriteIdeas = await ideaServices.getUserFavorites(
        parseInt(userId),
        {
          limit: limit ? parseInt(limit) : 50,
          offset: offset ? parseInt(offset) : 0
        }
      )

      return res.render('favorites', {
        ideas: favoriteIdeas,
        activePage: 'favorites'
      })
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  }
}

module.exports = ideaController
