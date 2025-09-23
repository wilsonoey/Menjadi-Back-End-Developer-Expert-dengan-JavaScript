const SequelizePool = require('../SequelizePool');
const sequelize = require('../sequelize');

// Mock sequelize
jest.mock('../sequelize', () => ({
  query: jest.fn(),
  QueryTypes: {
    SELECT: 'SELECT'
  },
  authenticate: jest.fn(),
  close: jest.fn()
}));

jest.mock('../models', () => ({
  User: {},
  Thread: {},
  Comment: {},
  Reply: {}
}));

describe('SequelizePool', () => {
  let pool;

  beforeEach(() => {
    pool = new SequelizePool();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create SequelizePool instance correctly', () => {
      expect(pool._sequelize).toBe(sequelize);
    });
  });

  describe('query method', () => {
    it('should handle SELECT queries correctly', async () => {
      // Arrange
      const mockResults = [{ id: 1, name: 'test' }];
      sequelize.query.mockResolvedValueOnce([mockResults]);

      const queryConfig = {
        text: 'SELECT * FROM users',
        values: []
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(sequelize.query).toHaveBeenCalledWith(
        'SELECT * FROM users',
        {
          replacements: [],
          type: 'SELECT'
        }
      );
      expect(result).toEqual({
        rows: mockResults,
        rowCount: 1
      });
    });

    it('should handle INSERT queries correctly', async () => {
      // Arrange
      const mockResults = [{ id: 1 }];
      const mockMetadata = { rowCount: 1 };
      sequelize.query.mockResolvedValueOnce([mockResults, mockMetadata]);

      const queryConfig = {
        text: 'INSERT INTO users (name) VALUES (?)',
        values: ['test']
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(result).toEqual({
        rows: mockResults,
        rowCount: 1
      });
    });

    // TODO 210925: Additional test case to cover the else branch where results might be null
    it('should handle INSERT queries where results are not returned', async () => {
      // Arrange
      const mockMetadata = { rowCount: 1 };
      // Simulasi `results` yang null
      sequelize.query.mockResolvedValueOnce([null, mockMetadata]);

      const queryConfig = {
        text: 'INSERT INTO users (name) VALUES (?)',
        values: ['test']
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(result).toEqual({
        rows: [],
        rowCount: 1 // Ini akan menguji cabang (metadata && metadata.rowCount) || 1
      });
    });

    it('should handle UPDATE queries correctly', async () => {
      // Arrange
      const mockMetadata = 1; // affected rows
      sequelize.query.mockResolvedValueOnce([null, mockMetadata]);

      const queryConfig = {
        text: 'UPDATE users SET name = ? WHERE id = ?',
        values: ['newname', 1]
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(result).toEqual({
        rows: [],
        rowCount: 1
      });
    });

    it('should handle DELETE queries correctly', async () => {
      // Arrange
      const mockMetadata = 1; // affected rows
      sequelize.query.mockResolvedValueOnce([null, mockMetadata]);

      const queryConfig = {
        text: 'DELETE FROM users WHERE id = ?',
        values: [1]
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(result).toEqual({
        rows: [],
        rowCount: 1
      });
    });

    it('should handle other query types correctly', async () => {
      // Arrange
      const mockResults = [];
      sequelize.query.mockResolvedValueOnce([mockResults, null]);

      const queryConfig = {
        text: 'CREATE TABLE test (id INT)',
        values: []
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      expect(result).toEqual({
        rows: [],
        rowCount: 0
      });
    });

    it('should throw error when query fails', async () => {
      // Arrange
      const error = new Error('Database connection failed');
      sequelize.query.mockRejectedValueOnce(error);

      const queryConfig = {
        text: 'SELECT * FROM users',
        values: []
      };

      // Action & Assert
      await expect(pool.query(queryConfig)).rejects.toThrow('Database connection failed');
    });

    // TODO 210925: Additional test case to cover the else branch where results might be null
    it('should handle other query types where results are null', async () => {
      // Arrange
      // Simulasi `results` yang null
      sequelize.query.mockResolvedValueOnce([null, null]);

      const queryConfig = {
        text: 'CREATE TABLE test (id INT)',
        values: []
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      // Ini akan menguji cabang `|| []` dan `|| 0`
      expect(result).toEqual({
        rows: [],
        rowCount: 0
      });
    });

    // TODO 210925: Tambahkan tes ini di dalam describe('query method', () => { ... });
    it('should handle INSERT queries where metadata is also null', async () => {
      // Arrange
      // Simulasi `results` dan `metadata` keduanya null
      sequelize.query.mockResolvedValueOnce([null, null]);

      const queryConfig = {
        text: 'INSERT INTO users (name) VALUES (?)',
        values: ['test']
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      // Ini akan menguji cabang fallback `|| 1`
      expect(result).toEqual({
        rows: [],
        rowCount: 1
      });
    });

    // TODO 210925: Tambahkan tes ini di dalam describe('query method', () => { ... });
    it('should handle UPDATE queries with no affected rows', async () => {
      // Arrange
      const mockMetadata = 0; // 0 affected rows (nilai falsy)
      sequelize.query.mockResolvedValueOnce([null, mockMetadata]);

      const queryConfig = {
        text: 'UPDATE users SET name = ? WHERE id = ?',
        values: ['newname', 999] // ID yang tidak ada
      };

      // Action
      const result = await pool.query(queryConfig);

      // Assert
      // Ini akan menguji cabang fallback `|| 0`
      expect(result).toEqual({
        rows: [],
        rowCount: 0
      });
    });
  });

  describe('execute method', () => {
    it('should call query method', async () => {
      // Arrange
      const queryConfig = {
        text: 'SELECT * FROM users',
        values: []
      };
      
      const mockResults = [{ id: 1 }];
      sequelize.query.mockResolvedValueOnce([mockResults]);

      // Action
      const result = await pool.execute(queryConfig);

      // Assert
      expect(sequelize.query).toHaveBeenCalled();
      expect(result.rows).toEqual(mockResults);
    });
  });

  describe('getSequelize method', () => {
    it('should return sequelize instance', () => {
      // Action
      const result = pool.getSequelize();

      // Assert
      expect(result).toBe(sequelize);
    });
  });

  describe('getModels method', () => {
    it('should return models', () => {
      // Action
      const result = pool.getModels();

      // Assert
      expect(result).toBeDefined();
    });
  });

  describe('authenticate method', () => {
    it('should call sequelize authenticate', async () => {
      // Arrange
      sequelize.authenticate.mockResolvedValueOnce(true);

      // Action
      await pool.authenticate();

      // Assert
      expect(sequelize.authenticate).toHaveBeenCalled();
    });
  });

  describe('close method', () => {
    it('should call sequelize close', async () => {
      // Arrange
      sequelize.close.mockResolvedValueOnce();

      // Action
      await pool.close();

      // Assert
      expect(sequelize.close).toHaveBeenCalled();
    });
  });
});