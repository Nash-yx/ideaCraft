'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'background_color', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: 'linear-gradient(135deg, #E879F9 0%, #8B5CF6 25%, #06B6D4 50%, #10B981 75%, #F59E0B 100%)'
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'background_color')
  }
}
