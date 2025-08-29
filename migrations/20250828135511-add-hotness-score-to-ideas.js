'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 添加熱門度分數欄位
    await queryInterface.addColumn('Ideas', 'hotness_score', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Pre-calculated hotness score for efficient pagination'
    })

    // 添加最後更新時間欄位
    await queryInterface.addColumn('Ideas', 'last_hotness_update', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp of last hotness score update'
    })

    // 建立複合索引以優化查詢效能
    await queryInterface.addIndex('Ideas', {
      fields: ['is_public', 'hotness_score', 'created_at', 'id'],
      name: 'idx_ideas_hotness_pagination',
      using: 'BTREE'
    })

    // 為現有的公開想法計算初始熱門度分數
    // 使用簡化公式：基於創建時間的初始分數
    await queryInterface.sequelize.query(`
      UPDATE Ideas 
      SET 
        hotness_score = CASE 
          WHEN is_public = 1 THEN 
            GREATEST(0, 100 - DATEDIFF(NOW(), created_at) * 2)
          ELSE 0 
        END,
        last_hotness_update = NOW()
      WHERE hotness_score = 0
    `)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('Ideas', 'idx_ideas_hotness_pagination')

    await queryInterface.removeColumn('Ideas', 'last_hotness_update')
    await queryInterface.removeColumn('Ideas', 'hotness_score')
  }
}
