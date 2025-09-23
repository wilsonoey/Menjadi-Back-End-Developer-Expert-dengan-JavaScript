const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const RegisterUser = require('../../../Domains/users/entities/RegisterUser');
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser');
const UserRepositoryPostgres = require('../UserRepositoryPostgres');
// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const SequelizePool = require('../../database/SequelizePool');

const pool = new SequelizePool();

describe('UserRepositoryPostgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // TODO 110925: Implementasikan penutupan koneksi Sequelize jika diperlukan
    await pool.close();
  });

  // TODO 120925: Sesuaikan test berikut jika diperlukan
  describe('UserRepositoryPostgres constructor', () => {
    it('should set this._models when pool has getModels method', () => {
      // Arrange
      const pool = {
        getModels: jest.fn().mockReturnValue('models')
      };
      
      // Act
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      
      // Assert
      expect(pool.getModels).toHaveBeenCalled();
      expect(userRepositoryPostgres._models).toEqual('models');
    });

    it('should not set this._models when pool does not have getModels method', () => {
      // Arrange
      const pool = {};
      
      // Act
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      
      // Assert
      expect(userRepositoryPostgres._models).toBeUndefined();
    });
  });

  describe('verifyAvailableUsername function', () => {
    // TODO 150925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres({});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding'))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should throw InvariantError when username not available', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ username: 'dicoding' }); // memasukan user baru dengan username dicoding
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).rejects.toThrowError(InvariantError);
    });

    it('should not throw InvariantError when username available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.verifyAvailableUsername('dicoding')).resolves.not.toThrowError(InvariantError);
    });
  });

  describe('addUser function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const userRepositoryPostgres = new UserRepositoryPostgres({}, () => '123');

      // Action & Assert
      await expect(userRepositoryPostgres.addUser(registerUser))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should persist register user and return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await userRepositoryPostgres.addUser(registerUser);

      // Assert
      const users = await UsersTableTestHelper.findUsersById('user-123');
      expect(users).toHaveLength(1);
    });

    it('should return registered user correctly', async () => {
      // Arrange
      const registerUser = new RegisterUser({
        username: 'dicoding',
        password: 'secret_password',
        fullname: 'Dicoding Indonesia',
      });
      const fakeIdGenerator = () => '123'; // stub!
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const registeredUser = await userRepositoryPostgres.addUser(registerUser);

      // Assert
      expect(registeredUser).toStrictEqual(new RegisteredUser({
        id: 'user-123',
        username: 'dicoding',
        fullname: 'Dicoding Indonesia',
      }));
    });
  });

  describe('getPasswordByUsername', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres({});

      // Action & Assert
      await expect(userRepositoryPostgres.getPasswordByUsername('dicoding'))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should throw InvariantError when user not found', () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(userRepositoryPostgres.getPasswordByUsername('dicoding'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return username password when user is found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser({
        username: 'dicoding',
        password: 'secret_password',
      });

      // Action & Assert
      const password = await userRepositoryPostgres.getPasswordByUsername('dicoding');
      expect(password).toBe('secret_password');
    });
  });

  describe('getIdByUsername', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres({});
      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername('dicoding'))
        .rejects.toThrow('Sequelize models not available');
    });
    
    it('should throw InvariantError when user not found', async () => {
      // Arrange
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(userRepositoryPostgres.getIdByUsername('dicoding'))
        .rejects
        .toThrowError(InvariantError);
    });

    it('should return user id correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'dicoding' });
      const userRepositoryPostgres = new UserRepositoryPostgres(pool, {});

      // Action
      const userId = await userRepositoryPostgres.getIdByUsername('dicoding');

      // Assert
      expect(userId).toEqual('user-321');
    });
  });
});
