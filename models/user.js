'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      User.hasMany(models.Idea, { foreignKey: 'userId' })
      User.hasMany(models.Favorite, { foreignKey: 'userId' })
      User.belongsToMany(models.Idea, {
        through: models.Favorite,
        foreignKey: 'userId',
        otherKey: 'ideaId',
        as: 'favoriteIdeas'
      })
    }
  }
  User.init(
    {
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      googleId: DataTypes.STRING,
      githubId: DataTypes.STRING,
      avatar: DataTypes.STRING,
      role: DataTypes.STRING,
      bio: DataTypes.TEXT,
      backgroundColor: {
        type: DataTypes.TEXT,
        field: 'background_color',
        defaultValue: 'linear-gradient(135deg, #E879F9 0%, #8B5CF6 25%, #06B6D4 50%, #10B981 75%, #F59E0B 100%)'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users',
      underscored: true,
    }
  )
  return User
}
