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
    
    try {
      if (isSelect) {
        const [results] = await this._sequelize.query(text, {
          replacements: values,
          type: this._sequelize.QueryTypes.SELECT,
        });

        return {
          rows: results,
          rowCount: results.length,
        };
      } else {
        // For INSERT, UPDATE, DELETE
        const [results, metadata] = await this._sequelize.query(text, {
          replacements: values,
        });

        // Handle different types of non-SELECT queries
        if (trimmedText.startsWith('INSERT')) {
          return {
            rows: results || [],
            rowCount: results ? results.length : (metadata && metadata.rowCount) || 1,
          };
        } else if (trimmedText.startsWith('UPDATE') || trimmedText.startsWith('DELETE')) {
          return {
            rows: [],
            rowCount: metadata || 0,
          };
        } else {
          return {
            rows: results || [],
            rowCount: (results && results.length) || 0,
          };
        }
      }
    } catch (error) {
      // Convert Sequelize errors to match pg pool error format
      throw error;
    }
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