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
        foreignKey: 'ideaId',
        as: 'tags'
      })
      Idea.hasMany(models.Favorite, { foreignKey: 'ideaId' })
      Idea.hasMany(models.View, { foreignKey: 'ideaId' })
      Idea.belongsToMany(models.User, {
        through: models.Favorite,
        foreignKey: 'ideaId',
        otherKey: 'userId',
        as: 'favoriteUsers'
      })
    }
  }
  Idea.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    userId: DataTypes.INTEGER,
    isPublic: DataTypes.BOOLEAN,
    shareLink: DataTypes.STRING,
    hotnessScore: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Pre-calculated hotness score for efficient pagination'
    },
    lastHotnessUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Timestamp of last hotness score update'
    }
  }, {
    sequelize,
    modelName: 'Idea',
    tableName: 'Ideas',
    underscored: true,
  })
  return Idea
}
