'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Favorites', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idea_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ideas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    })

    // 建立複合索引：確保同一用戶不能重複收藏同一個想法
    await queryInterface.addIndex('Favorites', ['user_id', 'idea_id'], {
      unique: true,
      name: 'unique_user_idea_favorite'
    })

    // 建立效能優化索引：用於查詢特定用戶的收藏
    await queryInterface.addIndex('Favorites', ['user_id', 'created_at'], {
      name: 'idx_favorites_user_created'
    })

    // 建立效能優化索引：用於查詢特定想法的收藏數
    await queryInterface.addIndex('Favorites', ['idea_id', 'created_at'], {
      name: 'idx_favorites_idea_created'
    })
  },

  async down (queryInterface, Sequelize) {
    // 移除索引
    await queryInterface.removeIndex('Favorites', 'unique_user_idea_favorite')
    await queryInterface.removeIndex('Favorites', 'idx_favorites_user_created')
    await queryInterface.removeIndex('Favorites', 'idx_favorites_idea_created')

    // 刪除表格
    await queryInterface.dropTable('Favorites')
  }
}
