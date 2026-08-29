const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

class UserCommentLike extends Model {}

UserCommentLike.init({
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
  },
  comment_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'user_comment_likes',
  modelName: 'UserCommentLike',
  timestamps: false,
  underscored: true,
});

module.exports = UserCommentLike;
