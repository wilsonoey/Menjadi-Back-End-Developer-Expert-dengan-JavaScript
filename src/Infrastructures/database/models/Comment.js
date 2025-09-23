const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// TODO 090925: Define Comment model using Sequelize
// TODO 100925: Use Model.init() method to define the model
// UNUSED 210925: Define associations here
class Comment extends Model {}

Comment.init({
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
  thread_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'thread_id', // Eksplisit mapping ke kolom database
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
  is_delete: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_delete', // Eksplisit mapping ke kolom database
  },
}, {
  sequelize,
  tableName: 'comments',
  modelName: 'Comment',
  timestamps: false,
  underscored: true, // Mencegah konversi snake_case ke camelCase
});

module.exports = Comment;