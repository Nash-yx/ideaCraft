const { Idea, User } = require('../models')
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
  },
  getIdea: async (req) => {
    const idea = await Idea.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      raw: true,
      nest: true
    })

    if (!idea) throw new Error('Idea not found')

    if (idea.userId !== req.user.id) {
      throw new Error('Unauthorized access')
    }

    return idea
  },
  updateIdea: async (req) => {
    const { title, content, isPublic } = req.body
    const ideaId = req.params.id
    const userId = req.user.id

    // 輸入驗證
    if (!title || !title.trim()) {
      throw new Error('Title is required')
    }
    if (!content || !content.trim()) {
      throw new Error('Content is required')
    }

    // 找到並驗證權限
    const idea = await Idea.findByPk(ideaId)
    if (!idea) throw new Error('Idea not found')
    if (idea.userId !== userId) throw new Error('Unauthorized access')

    // 準備更新資料
    const updateData = {
      title: title.trim(),
      content: content.trim(),
      isPublic: isPublic === 'true' || isPublic === true
    }

    // 處理 shareLink
    if (updateData.isPublic && !idea.shareLink) {
      updateData.shareLink = uuidv4()
    } else if (!updateData.isPublic) {
      updateData.shareLink = null
    }

    const updatedIdea = await idea.update(updateData)
    return updatedIdea
  },
  deleteIdea: async (req) => {
    const ideaId = req.params.id
    const userId = req.user.id

    // 找到並驗證權限
    const idea = await Idea.findByPk(ideaId)
    if (!idea) throw new Error('Idea not found')
    if (idea.userId !== userId) throw new Error('Unauthorized access')

    // 執行刪除
    await idea.destroy()
  },
  getPublicIdeas: async () => {
    const ideas = await Idea.findAll({
      where: { isPublic: true },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      order: [['createdAt', 'DESC']],
      raw: true,
      nest: true
    })

    return ideas
  },
  getIdeaByShareLink: async (shareLink) => {
    const idea = await Idea.findOne({
      where: { shareLink },
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }],
      raw: true,
      nest: true
    })
    if (!idea) throw new Error('Idea not found')
    return idea
  }
}

module.exports = ideaServices
