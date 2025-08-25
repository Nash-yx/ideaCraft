'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Views', {
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
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })

    await queryInterface.addIndex('Views', ['user_id', 'idea_id', 'created_at'], {
      name: 'idx_views_user_idea_time'
    })

    await queryInterface.addIndex('Views', ['idea_id'], {
      name: 'idx_views_idea_count'
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Views')
  }
}
