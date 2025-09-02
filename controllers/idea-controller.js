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
        const idea = await ideaServices.getIdeaByShareLink(req.query.share, req.user.id)
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
          activePage: 'explore',
          isOwner
        })
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
  },

  // API 端點：分頁探索想法
  getExploreIdeasAPI: async (req, res, next) => {
    try {
      const { cursor, limit = 10, q: searchQuery = '' } = req.query
      const userId = req.user.id

      // 參數驗證
      const pageLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 20) // 限制在1-20之間
      const trimmedQuery = (searchQuery || '').trim().substring(0, 50) // 限制搜尋字串長度

      // 呼叫 service 獲取分頁資料
      const result = await ideaServices.getPublicIdeasPaginated(
        cursor,
        pageLimit,
        trimmedQuery,
        userId
      )
      console.log(result)
      // 返回 JSON 格式
      return res.json({
        success: true,
        ideas: result.ideas,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        currentPage: {
          count: result.ideas.length,
          searchQuery: trimmedQuery,
          hasSearch: trimmedQuery.length > 0
        }
      })
    } catch (error) {
      console.error('API error in getExploreIdeasAPI:', error.message)

      // 區分不同類型的錯誤
      if (error.message.includes('Invalid cursor')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid cursor parameter',
          code: 'INVALID_CURSOR'
        })
      }

      if (error.message.includes('Database')) {
        return res.status(500).json({
          success: false,
          error: 'Database error occurred',
          code: 'DATABASE_ERROR'
        })
      }

      // 一般錯誤
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      })
    }
  }
}

module.exports = ideaController
