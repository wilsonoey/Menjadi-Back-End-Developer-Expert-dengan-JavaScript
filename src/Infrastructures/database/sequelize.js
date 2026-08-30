const pg = require('pg');
require('pg-hstore');
const { Sequelize } = require('sequelize');

const isTest = process.env.NODE_ENV === 'test';

const config = isTest ? {
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

const dialectOptions = {
  keepAlive: true,
};
if (config.host && config.host !== 'localhost' && config.host !== '127.0.0.1') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: false,
  };
}

const sequelize = new Sequelize(
  config.database || 'postgres',
  config.username || 'postgres',
  config.password || '',
  {
    host: config.host || 'localhost',
    port: Number(config.port) || 5432,
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions,
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 2500,
      acquire: 30000,
      evict: 1000,
    },
    retry: {
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /ECONNRESET/,
        /EPIPE/,
      ],
      max: 5,
    },
  },
);

module.exports = sequelize;
