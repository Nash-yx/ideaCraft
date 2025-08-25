'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class View extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      View.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      })

      View.belongsTo(models.Idea, {
        foreignKey: 'ideaId',
        as: 'idea'
      })
    }
  }
  View.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ideaId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'View',
    tableName: 'Views',
    underscored: true,
  })
  return View
}
