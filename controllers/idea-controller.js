const ideaServices = require('../services/idea-services')

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
      return res.render('idea-detail', { idea, activePage: 'ideas' })
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ideas')
    }
  },
  getNewIdea: async (req, res, next) => {
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
  getEditIdea: async (req, res, next) => {
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
  }
}

module.exports = ideaController
