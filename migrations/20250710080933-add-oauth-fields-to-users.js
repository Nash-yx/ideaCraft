'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'google_id', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('Users', 'github_id', {
      type: Sequelize.STRING,
      allowNull: true,
    })

    await queryInterface.addColumn('Users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'google_id')
    await queryInterface.removeColumn('Users', 'github_id')
    await queryInterface.removeColumn('Users', 'avatar')
  },
}
