const { Idea, User, Tag } = require('../models')
const { v4: uuidv4 } = require('uuid')

const ideaServices = {
  getIdeas: async (req) => {
    const userId = req.user.id
    const ideas = await Idea.findAll({
      where: { userId },
      include: [{
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] } // 不包含關聯表的額外欄位, 不加 => tag: [{ ..., IdeaTag: { ... }, ...}]
      }],
      order: [['createdAt', 'DESC']],
      raw: false,
      nest: true
    })

    return ideas // 回傳空陣列也是正常的
  },
  postIdea: async (req) => {
    const { title, content, isPublic, tags } = req.body
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

    // 建立 idea
    const idea = await Idea.create(ideaData)

    // 處理標籤 (如果有提供)
    if (tags) {
      let tagNames = []

      // 處理不同格式的標籤輸入
      if (typeof tags === 'string') {
        try {
          // 嘗試解析 JSON 字串 , ex: '["frontend", "react"]'
          tagNames = JSON.parse(tags)
        } catch {
          // 如果不是 JSON，當作逗號分隔的字串處理 , ex: "frontend,react,javascript"
          tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      } else if (Array.isArray(tags)) {
        // ex: ["frontend", "react"]
        tagNames = tags
      }

      // 關聯 tag 到 idea
      await ideaServices.associateTagsWithIdea(idea, tagNames)
    }

    return idea
  },
  getIdea: async (req) => {
    const idea = await Idea.findByPk(req.params.id, {
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }, {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      raw: false,
      nest: true
    })

    if (!idea) throw new Error('Idea not found')

    if (idea.userId !== req.user.id) {
      throw new Error('Unauthorized access')
    }

    return idea
  },
  updateIdea: async (req) => {
    const { title, content, isPublic, tags } = req.body
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

    // 更新 idea 基本資料
    const updatedIdea = await idea.update(updateData)

    // 處理標籤更新
    if (tags !== undefined) {
      let tagNames = []

      // 處理不同格式的標籤輸入
      if (typeof tags === 'string') {
        try {
          // 嘗試解析 JSON 字串
          tagNames = JSON.parse(tags)
        } catch {
          // 如果不是 JSON，當作逗號分隔的字串處理
          tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        }
      } else if (Array.isArray(tags)) {
        tagNames = tags
      }

      // 更新標籤關聯 (會移除舊的關聯並建立新的)
      await ideaServices.associateTagsWithIdea(idea, tagNames)

      // 清理孤立的標籤 (在背景執行，不等待結果)
      setTimeout(() => {
        ideaServices.cleanupOrphanedTags().catch(console.error)
      }, 1000)
    }

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
  getPublicIdeas: async (searchQuery = '') => {
    const { Op } = require('sequelize')

    // 安全搜尋函數：驗證和淨化輸入
    function safeSearch (query) {
      // 基本驗證
      if (!query || typeof query !== 'string') {
        return null
      }

      const trimmed = query.trim()

      // 長度限制 (1-50 字符)
      if (trimmed.length < 1 || trimmed.length > 50) {
        return null
      }

      // 轉義 LIKE 特殊字符：% _ \
      return trimmed.replace(/[%_\\]/g, (match) => `\\${match}`)
    }

    // 基本查詢條件
    const baseWhere = { isPublic: true }

    // 安全的搜尋條件處理
    const safeQuery = safeSearch(searchQuery)
    const searchWhere = safeQuery
      ? {
          [Op.or]: [
            { title: { [Op.like]: `%${safeQuery}%` } },
            { content: { [Op.like]: `%${safeQuery}%` } },
            { '$User.name$': { [Op.like]: `%${safeQuery}%` } }
          ]
        }
      : {}

    // 合併查詢條件
    const whereClause = { ...baseWhere, ...searchWhere }

    const ideas = await Idea.findAll({
      where: whereClause,
      include: [{
        model: User,
        attributes: ['id', 'name', 'avatar']
      }, {
        model: Tag,
        as: 'tags',
        attributes: ['id', 'name'],
        through: { attributes: [] }
      }],
      order: [['createdAt', 'DESC']],
      limit: 50, // 限制結果數量防止大量資料返回
      raw: false,
      nest: true
    })

    return ideas
  },
  getIdeaByShareLink: async (shareLink) => {
    const idea = await Idea.findOne({
      where: { shareLink },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'avatar']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ],
      raw: false,
      nest: true
    })
    if (!idea) throw new Error('Idea not found')
    return idea
  },

  // Tag 相關服務函數
  createOrFindTags: async (tagNames) => {
    if (!tagNames || !Array.isArray(tagNames) || tagNames.length === 0) {
      return []
    }

    // 限制最多 3 個標籤
    const limitedTags = tagNames.slice(0, 3)

    // 清理和驗證標籤名稱
    const cleanTagNames = limitedTags
      .map(name => name.trim().toLowerCase())
      .filter(name => name.length > 0 && name.length <= 20)
      .filter((name, index, arr) => arr.indexOf(name) === index) // 去重複
    if (cleanTagNames.length === 0) {
      return []
    }

    // 使用 findOrCreate 來取得或建立標籤
    const tagPromises = cleanTagNames.map(name =>
      Tag.findOrCreate({
        where: { name },
        defaults: { name }
      })
    )

    const tagResults = await Promise.all(tagPromises)
    return tagResults.map(([tag]) => tag) // 取得標籤物件 (忽略 created 布林值)
  },

  associateTagsWithIdea: async (idea, tagNames) => {
    // bind tags to idea
    if (!tagNames || tagNames.length === 0) {
      return
    }

    // 建立或取得標籤
    const tags = await ideaServices.createOrFindTags(tagNames)

    // 建立關聯
    if (tags.length > 0) {
      await idea.setTags(tags)
    }
  },

  cleanupOrphanedTags: async () => {
    // 清理沒有任何 idea 關聯的孤立標籤
    const { Op } = require('sequelize')

    const orphanedTags = await Tag.findAll({
      include: [{
        model: Idea,
        as: 'ideas',
        required: false // 使用 LEFT JOIN，保留沒有關聯的記錄
      }],
      where: {
        '$ideas.id$': null
      }
    })

    if (orphanedTags.length > 0) {
      const orphanedIds = orphanedTags.map(tag => tag.id)
      await Tag.destroy({
        where: {
          id: { [Op.in]: orphanedIds }
        }
      })
    }

    return orphanedTags.length
  }
}

module.exports = ideaServices
