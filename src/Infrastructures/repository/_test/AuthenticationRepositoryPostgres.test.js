const InvariantError = require('../../../Commons/exceptions/InvariantError');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const SequelizePool = require('../../database/SequelizePool');

const pool = new SequelizePool();

describe('AuthenticationRepository postgres', () => {
  afterEach(async () => {
    await AuthenticationsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // TODO 110925: Implementasikan penutupan koneksi Sequelize jika diperlukan
    await pool.close();
  });

  // TODO 120925: Sesuaikan test berikut jika diperlukan
  describe('AuthenticationRepositoryPostgres constructor', () => {
    it('should set this._models when pool has getModels method', () => {
      // Arrange
      const pool = {
        getModels: jest.fn().mockReturnValue('models')
      };
      
      // Act
      const authRepositoryPostgres = new AuthenticationRepositoryPostgres(pool, {});
      
      // Assert
      expect(pool.getModels).toHaveBeenCalled();
      expect(authRepositoryPostgres._models).toEqual('models');
    });

    it('should not set this._models when pool does not have getModels method', () => {
      // Arrange
      const pool = {};
      
      // Act
      const authRepositoryPostgres = new AuthenticationRepositoryPostgres(pool, {});
      
      // Assert
      expect(authRepositoryPostgres._models).toBeUndefined();
    });
  });

  describe('addToken function', () => {
    // TODO 150925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres({});
      const token = 'token';

      // Action & Assert
      await expect(authenticationRepository.addToken(token))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should add token to database', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action
      await authenticationRepository.addToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(1);
      expect(tokens[0].token).toBe(token);
    });
  });

  describe('checkAvailabilityToken function', () => {
    // TODO 150925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres({});
      const token = 'token';

      // Action & Assert
      await expect(authenticationRepository.checkAvailabilityToken(token))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should throw InvariantError if token not available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';

      // Action & Assert
      await expect(authenticationRepository.checkAvailabilityToken(token))
        .rejects.toThrow(InvariantError);
    });

    it('should not throw InvariantError if token available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action & Assert
      await expect(authenticationRepository.checkAvailabilityToken(token))
        .resolves.not.toThrow(InvariantError);
    });
  });

  describe('deleteToken', () => {
    // TODO 150925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw InvariantError when token not found', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);

      // Action & Assert
      await expect(authenticationRepository.deleteToken('non-existent-token'))
        .rejects.toThrow(InvariantError);
    });

    it('should throw an error if models are not available', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres({});
      const token = 'token';

      // Action & Assert
      await expect(authenticationRepository.deleteToken(token))
        .rejects.toThrow('Sequelize models not available');
    });
    
    it('should delete token from database', async () => {
      // Arrange
      const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
      const token = 'token';
      await AuthenticationsTableTestHelper.addToken(token);

      // Action
      await authenticationRepository.deleteToken(token);

      // Assert
      const tokens = await AuthenticationsTableTestHelper.findToken(token);
      expect(tokens).toHaveLength(0);
    });
  });
});
