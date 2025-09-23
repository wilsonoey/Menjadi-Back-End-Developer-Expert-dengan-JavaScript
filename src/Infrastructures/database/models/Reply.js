const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// UNUSED 210925: Define associations here
class Reply extends Model {}

Reply.init({
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  commentId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'comments',
      key: 'id',
    },
  },
  threadId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'threads',
      key: 'id',
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  isDelete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
}, {
  sequelize,
  tableName: 'comment_replies',
  modelName: 'Reply',
  timestamps: false,
  underscored: true, // This will convert camelCase JS properties to snake_case DB columns
});

module.exports = Reply;