/**
 * Cursor-based 分頁工具
 * 用於編碼和解碼分頁游標
 */

const cursorUtils = {
  /**
   * 編碼游標
   * @param {number} hotnessScore - 熱門度分數
   * @param {string|Date} createdAt - 創建時間
   * @param {number} id - 想法ID
   * @returns {string} Base64編碼的游標字串
   */
  encodeCursor: (hotnessScore, createdAt, id) => {
    try {
      // 確保參數有效
      if (typeof hotnessScore !== 'number' || typeof id !== 'number') {
        throw new Error('Invalid cursor parameters: hotnessScore and id must be numbers')
      }

      // 統一時間格式為 ISO 字串
      const dateString = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString()

      // 建立游標物件
      const cursorObj = {
        h: parseFloat(hotnessScore.toFixed(2)), // 熱門度分數，保留2位小數
        c: dateString,                          // 創建時間
        i: id                                   // 想法ID
      }

      // JSON字串化後Base64編碼
      const jsonString = JSON.stringify(cursorObj)
      const base64String = Buffer.from(jsonString, 'utf8').toString('base64')

      return base64String
    } catch (error) {
      console.error('Error encoding cursor:', error.message)
      return null
    }
  },

  /**
   * 解碼游標
   * @param {string} cursorString - Base64編碼的游標字串
   * @returns {Object|null} 解碼後的游標物件 {hotnessScore, createdAt, id}
   */
  decodeCursor: (cursorString) => {
    try {
      if (!cursorString || typeof cursorString !== 'string') {
        return null
      }

      // Base64解碼後解析JSON
      const jsonString = Buffer.from(cursorString, 'base64').toString('utf8')
      const cursorObj = JSON.parse(jsonString)

      // 驗證必要欄位
      if (!('h' in cursorObj) ||
          !('c' in cursorObj) ||
          !('i' in cursorObj)) {
        throw new Error('Invalid cursor structure')
      }

      // 驗證資料類型
      const hotnessScore = parseFloat(cursorObj.h)
      const id = parseInt(cursorObj.i)

      if (isNaN(hotnessScore) || isNaN(id)) {
        throw new Error('Invalid cursor data types')
      }

      // 驗證日期格式
      const createdAt = new Date(cursorObj.c)
      if (isNaN(createdAt.getTime())) {
        throw new Error('Invalid cursor date format')
      }

      return {
        hotnessScore,
        createdAt: cursorObj.c, // 保持字串格式供 SQL 查詢使用
        id
      }
    } catch (error) {
      console.error('Error decoding cursor:', error.message)
      return null
    }
  },

  /**
   * 驗證游標是否有效
   * @param {string} cursorString - 游標字串
   * @returns {boolean} 是否有效
   */
  isValidCursor: (cursorString) => {
    return cursorUtils.decodeCursor(cursorString) !== null
  },

  /**
   * 建立 WHERE 條件用於 cursor-based 分頁
   * @param {Object} cursor - 解碼後的游標物件
   * @param {Object} Op - Sequelize operators
   * @returns {Object} WHERE 條件物件
   */
  buildWhereCondition: (cursor, Op) => {
    if (!cursor) {
      return {}
    }

    const { hotnessScore, createdAt, id } = cursor

    // 複合排序的 WHERE 條件
    // 邏輯：下一批資料的熱度分數要比游標位置更低
    // 如果熱度相同，則創建時間要更早
    // 如果時間也相同，則ID要更小
    return {
      [Op.or]: [
        // 熱度分數更低
        { hotnessScore: { [Op.lt]: hotnessScore } },
        // 熱度相同但創建時間更早
        {
          [Op.and]: [
            { hotnessScore },
            { createdAt: { [Op.lt]: createdAt } }
          ]
        },
        // 熱度和時間都相同但ID更小
        {
          [Op.and]: [
            { hotnessScore },
            { createdAt },
            { id: { [Op.lt]: id } }
          ]
        }
      ]
    }
  }
}

module.exports = cursorUtils
