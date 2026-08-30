const sequelize = require('./sequelize');

// TODO 090925: Implement SequelizePool class to mimic pg
class SequelizePool {
  constructor() {
    this._sequelize = sequelize;
  }

  // Maintain compatibility with existing pg pool interface
  async query(queryConfig) {
    const { text, values } = queryConfig;

    // Determine query type
    const trimmedText = text.trim().toUpperCase();
    const isSelect = trimmedText.startsWith('SELECT');

    if (isSelect) {
      const [results = []] = await this._sequelize.query(text, {
        replacements: values,
        type: 'SELECT',
      });

      return {
        rows: results || [],
        rowCount: results ? results.length : 0,
      };
    }
    // For INSERT, UPDATE, DELETE
    const [results, metadata] = await this._sequelize.query(text, {
      replacements: values,
    });

    // Handle different types of non-SELECT queries
    if (trimmedText.startsWith('INSERT')) {
      let rowCount = 1;
      if (results && results.length) {
        rowCount = results.length;
      } else if (metadata && typeof metadata === 'object' && 'rowCount' in metadata) {
        rowCount = Number(metadata.rowCount);
      }
      return {
        rows: results || [],
        rowCount,
      };
    }
    if (trimmedText.startsWith('UPDATE') || trimmedText.startsWith('DELETE')) {
      let rowCount = 0;
      if (typeof metadata === 'number') {
        rowCount = metadata;
      } else if (metadata && typeof metadata === 'object' && 'rowCount' in metadata) {
        rowCount = Number(metadata.rowCount);
      }
      return {
        rows: [],
        rowCount,
      };
    }
    return {
      rows: results || [],
      rowCount: (results && results.length) || 0,
    };
  }

  // For non-SELECT queries (kept for backward compatibility)
  async execute(queryConfig) {
    return this.query(queryConfig);
  }

  // Provide access to Sequelize instance for ORM operations
  getSequelize() {
    return this._sequelize;
  }

  // Provide access to models
  getModels() {
    return require('./models');
  }

  // Add method to test connection
  async authenticate() {
    return this._sequelize.authenticate();
  }

  // Add method to close connection
  async close() {
    return this._sequelize.close();
  }
}

module.exports = SequelizePool;
