const aiProjectController = {
  getCreatePage: async (req, res, next) => {
    try {
      return res.render('ai-project-create', {
        activePage: 'ai-projects'
      })
    } catch (err) {
      next(err)
    }
  },

  postProject: async (req, res, next) => {
    try {
      // 將來這裡會：
      // 1. 驗證用戶輸入
      // 2. 調用AI API分析專案
      // 3. 保存project/stories/tasks到資料庫
      // const project = await aiProjectServices.createProject(req)

      req.flash('success_msg', 'AI analysis completed successfully')
      return res.redirect('/ai-projects')
    } catch (err) {
      req.flash('error_msg', err.message)
      return res.redirect('/ai-projects/create')
    }
  }
}

module.exports = aiProjectController
