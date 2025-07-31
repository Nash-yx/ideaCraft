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
      return res.redirect('/')
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/')
    }
  },
  getIdea: async (req, res, next) => {
    try {
      const idea = await ideaServices.getIdea(req)

      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        // AJAX 請求：返回 JSON（用於編輯功能）
        return res.json({ success: true, idea })
      } else {
        // 直接訪問：顯示想法詳情頁面
        return res.render('idea-detail', { idea, activePage: 'ideas' })
      }
    } catch (err) {
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(404).json({ success: false, message: err.message })
      } else {
        req.flash('error_msg', err.message)
        return res.redirect('/')
      }
    }
  },
  updateIdea: async (req, res, next) => {
    try {
      await ideaServices.updateIdea(req)

      // 檢查請求是否為 AJAX (檢查 X-Requested-With header 或 Accept header)
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.json({ success: true, message: 'Idea updated successfully' })
      }

      req.flash('success_msg', 'Idea updated successfully')
      return res.redirect('/')
    } catch (err) {
      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(400).json({ success: false, message: err.message })
      }

      req.flash('error_msg', err.message)
      return res.redirect('/')
    }
  },
  deleteIdea: async (req, res, next) => {
    try {
      await ideaServices.deleteIdea(req)

      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.json({ success: true, message: 'Idea deleted successfully' })
      }

      req.flash('success_msg', 'Idea deleted successfully')
      return res.redirect('/')
    } catch (err) {
      // 檢查請求是否為 AJAX
      const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || (req.headers.accept && req.headers.accept.includes('application/json'))

      if (isAjax) {
        return res.status(400).json({ success: false, message: err.message })
      }

      req.flash('error_msg', err.message)
      return res.redirect('/')
    }
  }
}

module.exports = ideaController
