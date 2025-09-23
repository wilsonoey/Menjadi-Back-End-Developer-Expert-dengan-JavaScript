const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// TODO 090925: Define Thread model using Sequelize
// TODO 100925: Use Model.init() method to define the model
class Thread extends Model {}

Thread.init({
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true,
    allowNull: false,
  },
  title: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  body: {
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
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'threads',
  modelName: 'Thread',
  timestamps: false,
  underscored: true, // TODO 110925: Mencegah konversi snake_case ke camelCase
});

module.exports = Thread;