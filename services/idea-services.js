const { Idea } = require('../models')
const { v4: uuidv4 } = require('uuid')

const ideaServices = {
  getIdeas: async (req) => {
    const userId = req.user.id
    const ideas = await Idea.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      raw: true
    })

    return ideas // 回傳空陣列也是正常的
  },
  postIdea: async (req) => {
    const { title, content, isPublic } = req.body
    const userId = req.user.id

    // 輸入驗證
    if (!title || !title.trim()) {
      throw new Error('Title is required')
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required')
    }

    // 準備建立資料
    const ideaData = {
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === 'true' || isPublic === true,
      userId
    }

    // 如果是公開的idea，產生分享連結
    if (ideaData.isPublic) {
      ideaData.shareLink = uuidv4()
    }

    const idea = await Idea.create(ideaData)
    return idea
  }
}

module.exports = ideaServices
