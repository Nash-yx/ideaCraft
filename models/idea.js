'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Idea extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Idea.belongsTo(models.User, { foreignKey: 'userId' })
      Idea.belongsToMany(models.Tag, {
        through: models.IdeaTag,
        foreignKey: 'IdeaId',
        as: 'tags'
      })
    }
  }
  Idea.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    isPublic: DataTypes.BOOLEAN,
    shareLink: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Idea',
    tableName: 'Ideas',
    underscored: true,
  })
  return Idea
}
