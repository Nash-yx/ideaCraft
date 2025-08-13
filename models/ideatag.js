'use strict'
const {
  Model
} = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class IdeaTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  IdeaTag.init({
    ideaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Ideas',
        key: 'id'
      }
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Tags',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'IdeaTag',
    tableName: 'IdeaTags',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['idea_id', 'tag_id']
      }
    ]
  })
  return IdeaTag
}
