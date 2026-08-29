const AuthenticationTokenManager = require('../../Applications/security/AuthenticationTokenManager');
const InvariantError = require('../../Commons/exceptions/InvariantError');

class JwtTokenManager extends AuthenticationTokenManager {
  constructor(jwt) {
    super();
    this._jwt = jwt;
  }

  async createAccessToken(payload) {
    if (typeof this._jwt.generate === 'function') {
      return this._jwt.generate(payload, process.env.ACCESS_TOKEN_KEY);
    }
    return this._jwt.sign(payload, process.env.ACCESS_TOKEN_KEY);
  }

  async createRefreshToken(payload) {
    if (typeof this._jwt.generate === 'function') {
      return this._jwt.generate(payload, process.env.REFRESH_TOKEN_KEY);
    }
    return this._jwt.sign(payload, process.env.REFRESH_TOKEN_KEY);
  }

  async verifyRefreshToken(token) {
    try {
      if (typeof this._jwt.generate === 'function' || this._jwt.token) {
        const artifacts = this._jwt.decode(token);
        this._jwt.verify(artifacts, process.env.REFRESH_TOKEN_KEY);
      } else {
        this._jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      throw new InvariantError('refresh token tidak valid');
    }
  }

  async decodePayload(token) {
    const artifacts = this._jwt.decode(token);
    return (artifacts && artifacts.decoded && artifacts.decoded.payload)
      ? artifacts.decoded.payload
      : artifacts;
  }
}

module.exports = JwtTokenManager;
