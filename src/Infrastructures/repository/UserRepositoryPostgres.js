const InvariantError = require('../../Commons/exceptions/InvariantError');
const RegisteredUser = require('../../Domains/users/entities/RegisteredUser');
const UserRepository = require('../../Domains/users/UserRepository');

// TODO 090925: Implementasikan Sequelize
class UserRepositoryPostgres extends UserRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    
    // Get access to Sequelize models if using SequelizePool
    if (pool.getModels) {
      this._models = pool.getModels();
    }
  }

  // TODO 090925: Alternative ORM approach for verifyAvailableUsername
  async verifyAvailableUsername(username) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const user = await this._models.User.findOne({
      where: { username },
      attributes: ['username'] // Only select username field
    });

    if (user) {
      throw new InvariantError('username tidak tersedia');
    }
  }

  // TODO 090925: Alternative ORM approach for addUser
  async addUser(registerUser) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    // TODO 100925: Refactor to use ORM
    const { username, password, fullname } = registerUser;
    const id = `user-${this._idGenerator()}`;

    const user = await this._models.User.create({
      id,
      username,
      password,
      fullname
    });

    return new RegisteredUser({
      id: user.id,
      username: user.username,
      fullname: user.fullname
    });
  }

  // TODO 090925: Alternative ORM approach
  async getPasswordByUsername(username) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const user = await this._models.User.findOne({
      where: { username },
      attributes: ['password']
    });

    if (!user) {
      throw new InvariantError('username tidak ditemukan');
    }

    return user.password;
  }

  async getIdByUsername(username) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const user = await this._models.User.findOne({
      where: { username },
      attributes: ['id']
    });

    if (!user) {
      throw new InvariantError('user tidak ditemukan');
    }
    
    return user.id;
  }
}

module.exports = UserRepositoryPostgres;