const { Sequelize } = require('sequelize');

const config = process.env.NODE_ENV === 'test' ? {
  database: process.env.PGDATABASE_TEST || process.env.PGDATABASE,
  username: process.env.PGUSER_TEST || process.env.PGUSER,
  password: process.env.PGPASSWORD_TEST || process.env.PGPASSWORD,
  host: process.env.PGHOST_TEST || process.env.PGHOST,
  port: process.env.PGPORT_TEST || process.env.PGPORT,
} : {
  database: process.env.PGDATABASE,
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;