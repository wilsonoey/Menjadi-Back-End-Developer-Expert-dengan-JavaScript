const { Sequelize } = require('sequelize');

// TODO 090925: Create Sequelize instance using existing database configuration
// UNUSED 210925: Jangan sertakan logging dan pool di dalam Sequelize agar coverage testing meningkat
const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: 'postgres',
    // UNUSED 220925: Set timezone to +08:00
  }
);

module.exports = sequelize;