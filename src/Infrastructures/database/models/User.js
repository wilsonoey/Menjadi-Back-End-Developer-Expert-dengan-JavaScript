const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// TODO 090925: Define User model using Sequelize
// UNUSED 210925: Define associations here
class User extends Model {}

User.init({
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  fullname: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  sequelize,
  tableName: 'users',
  modelName: 'User',
  timestamps: false,
  underscored: true, // TODO 110925: Mencegah konversi snake_case ke camelCase
});

module.exports = User;