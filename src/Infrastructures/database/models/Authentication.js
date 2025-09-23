const { DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');

// TODO 090925: Define Authentication model using Sequelize
class Authentication extends Model {}

Authentication.init({
  token: {
    type: DataTypes.TEXT,
    allowNull: false,
    primaryKey: true, // Since this is the only field, make it primary key
  },
}, {
  sequelize,
  tableName: 'authentications',
  modelName: 'Authentication',
  timestamps: false,
});

module.exports = Authentication;