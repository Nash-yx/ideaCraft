'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. 修改欄位為 NOT NULL
    await queryInterface.changeColumn('IdeaTags', 'idea_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    })

    await queryInterface.changeColumn('IdeaTags', 'tag_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    })

    // 2. 添加外鍵約束
    await queryInterface.addConstraint('IdeaTags', {
      fields: ['idea_id'],
      type: 'foreign key',
      name: 'fk_idea_tags_idea_id',
      references: {
        table: 'Ideas',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addConstraint('IdeaTags', {
      fields: ['tag_id'],
      type: 'foreign key',
      name: 'fk_idea_tags_tag_id',
      references: {
        table: 'Tags',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    })

    // 3. 添加唯一索引 (防止重複關聯)
    await queryInterface.addIndex('IdeaTags', {
      fields: ['idea_id', 'tag_id'],
      unique: true,
      name: 'idx_idea_tags_unique'
    })

    // 4. 添加單獨的索引來優化查詢
    await queryInterface.addIndex('IdeaTags', {
      fields: ['idea_id'],
      name: 'idx_idea_tags_idea_id'
    })

    await queryInterface.addIndex('IdeaTags', {
      fields: ['tag_id'],
      name: 'idx_idea_tags_tag_id'
    })
  },

  async down (queryInterface, Sequelize) {
    // 移除索引
    await queryInterface.removeIndex('IdeaTags', 'idx_idea_tags_tag_id')
    await queryInterface.removeIndex('IdeaTags', 'idx_idea_tags_idea_id')
    await queryInterface.removeIndex('IdeaTags', 'idx_idea_tags_unique')

    // 移除外鍵約束
    await queryInterface.removeConstraint('IdeaTags', 'fk_idea_tags_tag_id')
    await queryInterface.removeConstraint('IdeaTags', 'fk_idea_tags_idea_id')

    // 恢復欄位為可空
    await queryInterface.changeColumn('IdeaTags', 'tag_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })

    await queryInterface.changeColumn('IdeaTags', 'idea_id', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
  }
}
