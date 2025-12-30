const { GoogleGenAI } = require('@google/genai')

class AIService {
  constructor () {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is required in environment variables')
    }

    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    this.model = 'gemini-2.5-flash'
  }

  /**
   * 生成專案分析的prompt模板
   * @param {string} projectDescription - 用戶輸入的專案描述
   * @returns {string} - 格式化的prompt
   */
  createAnalysisPrompt (projectDescription) {
    return `You are a senior project manager and software architect. Analyze the following project idea and break it down into specific user stories and technical tasks.

Project Description:
"${projectDescription}"

Please respond in JSON format, strictly following this structure:

{
  "project_analysis": {
    "title": "Project Title (max 50 characters)",
    "summary": "Project summary (max 200 characters)",
    "stories": [
      {
        "id": "story-1",
        "title": "Story Title (max 60 characters)",
        "description": "As a [user role], I want to [feature description], so that I can [value/goal]",
        "priority": "high",
        "status": "backlog",
        "tasks": [
          {
            "id": "task-1",
            "title": "Specific technical task (max 80 characters)",
            "description": "Detailed implementation notes (max 150 characters)",
            "status": "todo",
            "story_id": "story-1"
          }
        ]
      }
    ]
  }
}

Requirements:
1. Generate 3-5 user stories
2. Each story contains 2-4 technical tasks
3. Priority must be one of: "high", "medium", or "low"
4. Sort stories by priority (high first, then medium, then low)
5. Tasks should be specific and actionable
6. All text must be in English
7. Must be valid JSON format without markdown markers
8. Ensure proper JSON syntax with correct quotes and commas

IMPORTANT: Only respond with JSON, do not include any other explanatory text or markdown formatting.`
  }

  /**
   * 調用AI分析專案
   * @param {string} projectDescription - 專案描述
   * @returns {Promise<Object>} - 分析結果
   */
  async analyzeProject (projectDescription) {
    try {
      console.log('🤖 開始AI分析專案...')
      console.log('📝 專案描述:', projectDescription.substring(0, 100) + '...')

      // 驗證輸入
      if (!projectDescription || projectDescription.trim().length < 10) {
        throw new Error('專案描述太短，請提供更詳細的說明（至少10個字符）')
      }

      if (projectDescription.length > 1000) {
        throw new Error('專案描述太長，請控制在1000字符以內')
      }

      const prompt = this.createAnalysisPrompt(projectDescription.trim())

      // 調用Gemini API
      console.log('🌐 調用Gemini API...')
      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: prompt
      })

      if (!response || !response.text) {
        throw new Error('AI服務未返回有效回應')
      }

      const responseText = response.text
      console.log('✅ AI回應已接收，長度:', responseText.length)

      // 解析JSON回應
      const analysisResult = this.parseAIResponse(responseText)

      console.log('✅ AI分析完成，生成了', analysisResult.stories?.length || 0, '個故事')
      return analysisResult
    } catch (error) {
      console.error('❌ AI分析失敗:', error.message)

      // 處理不同類型的錯誤
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('AI服務暫時不可用，已達每日免費額度限制，請明天再試')
      }

      if (error.message.includes('API key') || error.message.includes('authentication') || error.message.includes('UNAUTHENTICATED')) {
        throw new Error('AI服務配置錯誤，請檢查API密鑰設置')
      }

      if (error.message.includes('網路') || error.message.includes('network') || error.message.includes('UNAVAILABLE')) {
        throw new Error('網路連接問題，請檢查網路狀況後重試')
      }

      // 如果是自定義錯誤，直接拋出
      if (error.message.includes('專案描述') || error.message.includes('回應格式') || error.message.includes('JSON')) {
        throw error
      }

      throw new Error(`AI分析失敗: ${error.message}`)
    }
  }

  /**
   * 解析AI的JSON回應
   * @param {string} text - AI回應文字
   * @returns {Object} - 解析後的結果
   */
  parseAIResponse (text) {
    try {
      // 清理回應文字（移除可能的markdown格式）
      let cleanedText = text.trim()

      console.log('📝 原始回應前100字符:', cleanedText.substring(0, 100))

      // 移除markdown code block標記
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '')
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/i, '').replace(/\s*```$/i, '')
      }

      // 移除可能的前導文字
      const jsonStart = cleanedText.indexOf('{')
      const jsonEnd = cleanedText.lastIndexOf('}')

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedText = cleanedText.substring(jsonStart, jsonEnd + 1)
      }

      console.log('🧹 清理後的JSON前100字符:', cleanedText.substring(0, 100))

      const parsed = JSON.parse(cleanedText)

      // 驗證回應格式
      if (!parsed.project_analysis) {
        throw new Error('回應格式無效：缺少project_analysis')
      }

      const analysis = parsed.project_analysis
      if (!analysis.stories || !Array.isArray(analysis.stories)) {
        throw new Error('回應格式無效：缺少stories陣列')
      }

      if (analysis.stories.length === 0) {
        throw new Error('回應格式無效：stories陣列為空')
      }

      // 驗證每個story的格式
      analysis.stories.forEach((story, index) => {
        if (!story.id || !story.title || !story.tasks) {
          throw new Error(`故事${index + 1}格式無效：缺少必要字段`)
        }

        if (!Array.isArray(story.tasks)) {
          throw new Error(`故事${index + 1}的tasks必須是陣列`)
        }

        if (story.tasks.length === 0) {
          throw new Error(`故事${index + 1}沒有任務`)
        }

        // 驗證每個task
        story.tasks.forEach((task, taskIndex) => {
          if (!task.id || !task.title || !task.story_id) {
            throw new Error(`故事${index + 1}的任務${taskIndex + 1}格式無效`)
          }
        })
      })

      console.log('✅ JSON格式驗證通過')
      return analysis
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('❌ JSON解析失敗:', error.message)
        console.error('🔍 有問題的文字:', text)
        throw new Error('AI回應格式無效，無法解析JSON。請重試。')
      }

      console.error('❌ 格式驗證失敗:', error.message)
      throw error
    }
  }

  /**
   * 測試AI服務連接
   * @returns {Promise<boolean>} - 連接是否成功
   */
  async testConnection () {
    try {
      console.log('🧪 測試AI服務連接...')

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: 'reply me: yes sir'
      })
      const text = response.text
      console.log('✅ AI服務連接測試成功:', text.substring(0, 50))
      return true
    } catch (error) {
      console.error('❌ AI服務連接測試失敗:', error.message)
      return false
    }
  }
}

module.exports = new AIService()
