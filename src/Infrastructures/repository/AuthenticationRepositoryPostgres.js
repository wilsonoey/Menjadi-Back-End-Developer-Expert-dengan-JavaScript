const InvariantError = require('../../Commons/exceptions/InvariantError');
const AuthenticationRepository = require('../../Domains/authentications/AuthenticationRepository');

class AuthenticationRepositoryPostgres extends AuthenticationRepository {
  constructor(pool) {
    super();
    this._pool = pool;
    
    // Get access to Sequelize models if using SequelizePool
    if (pool.getModels) {
      this._models = pool.getModels();
    }
  }

  async addToken(token) {
    // TODO 090925: Using Sequelize ORM (new approach - commented for now)
    // TODO 100925: Refactor to use ORM
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    await this._models.Authentication.create({ token });
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async checkAvailabilityToken(token) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const auth = await this._models.Authentication.findOne({
      where: { token }
    });
    
    if (!auth) {
      throw new InvariantError('refresh token tidak ditemukan di database');
    }
    
    return auth;
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async deleteToken(token) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const deletedCount = await this._models.Authentication.destroy({
      where: { token }
    });
    
    if (deletedCount === 0) {
      throw new InvariantError('token tidak ditemukan');
    }
  }
}

module.exports = AuthenticationRepositoryPostgres;