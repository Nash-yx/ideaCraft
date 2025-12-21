const aiService = require('../services/ai-service')

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
      console.log('🚀 開始處理AI專案分析請求')

      // 1. 驗證用戶輸入
      const { description } = req.body

      if (!description || description.trim().length === 0) {
        req.flash('error_msg', '請輸入專案描述')
        return res.redirect('/ai-projects')
      }

      if (description.length < 10) {
        req.flash('error_msg', '專案描述太短，請提供更詳細的說明（至少10個字符）')
        return res.redirect('/ai-projects')
      }

      if (description.length > 1000) {
        req.flash('error_msg', '專案描述太長，請控制在1000字符以內')
        return res.redirect('/ai-projects')
      }

      console.log('✅ 輸入驗證通過')
      console.log('👤 用戶:', req.user.name || req.user.email)
      console.log('📝 專案描述長度:', description.length)

      // 2. 調用AI API分析專案
      const analysisResult = await aiService.analyzeProject(description)

      console.log('✅ AI分析完成')
      console.log('📊 生成故事數:', analysisResult.stories?.length || 0)

      // 3. 暫時將結果以JSON格式返回（MVP階段）
      // 將來這裡會保存到資料庫並渲染kanban board
      return res.json({
        success: true,
        message: 'AI分析完成',
        data: analysisResult,
        meta: {
          user_id: req.user.id,
          input_length: description.length,
          stories_count: analysisResult.stories?.length || 0,
          tasks_count: analysisResult.stories?.reduce((total, story) =>
            total + (story.tasks?.length || 0), 0) || 0
        }
      })
    } catch (err) {
      console.error('❌ AI專案分析失敗:', err.message)

      // 記錄詳細錯誤信息
      console.error('錯誤詳情:', {
        user_id: req.user?.id,
        error_message: err.message,
        timestamp: new Date().toISOString()
      })

      // 處理不同類型的錯誤
      if (err.message.includes('免費額度')) {
        req.flash('error_msg', 'AI服務暫時不可用，已達每日免費額度限制。請明天再試或聯繫管理員。')
      } else if (err.message.includes('網路') || err.message.includes('連接')) {
        req.flash('error_msg', '網路連接問題，請檢查網路狀況後重試。')
      } else if (err.message.includes('專案描述')) {
        req.flash('error_msg', err.message)
      } else {
        req.flash('error_msg', 'AI分析失敗，請重試。如果問題持續，請聯繫技術支援。')
      }

      return res.redirect('/ai-projects')
    }
  },

  // 測試AI服務連接的端點（開發用）
  testAIConnection: async (req, res, next) => {
    try {
      console.log('🧪 測試AI服務連接...')

      const isConnected = await aiService.testConnection()

      return res.json({
        success: isConnected,
        message: isConnected ? 'AI服務連接正常' : 'AI服務連接失敗',
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      console.error('❌ AI連接測試失敗:', err.message)

      return res.status(500).json({
        success: false,
        message: 'AI服務測試失敗',
        error: err.message,
        timestamp: new Date().toISOString()
      })
    }
  }
}

module.exports = aiProjectController
