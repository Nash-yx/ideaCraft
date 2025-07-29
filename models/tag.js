'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Tag.belongsToMany(models.Idea, {
        through: models.IdeaTag,
        foreignKey: 'tagId',
        as: 'ideas'
      })
    }
  }
  Tag.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
    tableName: 'Tags',
    underscored: true,
  })
  return Tag
}
