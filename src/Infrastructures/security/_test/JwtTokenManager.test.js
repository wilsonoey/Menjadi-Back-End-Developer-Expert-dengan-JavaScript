const Jwt = require('jsonwebtoken');
const InvariantError = require('../../../Commons/exceptions/InvariantError');
const JwtTokenManager = require('../JwtTokenManager');

describe('JwtTokenManager', () => {
  describe('createAccessToken function', () => {
    it('should create accessToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const accessToken = await jwtTokenManager.createAccessToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, process.env.ACCESS_TOKEN_KEY);
      expect(accessToken).toEqual('mock_token');
    });
  });

  describe('createRefreshToken function', () => {
    it('should create refreshToken correctly', async () => {
      // Arrange
      const payload = {
        username: 'dicoding',
      };
      const mockJwtToken = {
        generate: jest.fn().mockImplementation(() => 'mock_token'),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action
      const refreshToken = await jwtTokenManager.createRefreshToken(payload);

      // Assert
      expect(mockJwtToken.generate).toHaveBeenCalledWith(payload, process.env.REFRESH_TOKEN_KEY);
      expect(refreshToken).toEqual('mock_token');
    });
  });

  describe('verifyRefreshToken function', () => {
    it('should throw InvariantError when verification failed', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken(accessToken))
        .rejects
        .toThrow(InvariantError);
    });

    it('should not throw InvariantError when refresh token verified with token object', async () => {
      // Arrange
      const mockJwtToken = {
        generate: jest.fn(),
        decode: jest.fn().mockReturnValue({ decoded: { payload: { username: 'dicoding' } } }),
        verify: jest.fn(),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);

      // Action & Assert
      await expect(jwtTokenManager.verifyRefreshToken('mock_refresh_token'))
        .resolves
        .not.toThrow(InvariantError);
      expect(mockJwtToken.decode).toHaveBeenCalledWith('mock_refresh_token');
      expect(mockJwtToken.verify).toHaveBeenCalled();
    });
  });

  describe('decodePayload function', () => {
    it('should decode payload correctly', async () => {
      // Arrange
      const jwtTokenManager = new JwtTokenManager(Jwt);
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'dicoding' });

      // Action
      const { username: expectedUsername } = await jwtTokenManager.decodePayload(accessToken);

      // Action & Assert
      expect(expectedUsername).toEqual('dicoding');
    });

    it('should decode payload correctly when artifacts contain decoded.payload', async () => {
      const mockJwtToken = {
        decode: jest.fn().mockReturnValue({ decoded: { payload: { username: 'dicoding' } } }),
      };
      const jwtTokenManager = new JwtTokenManager(mockJwtToken);
      const payload = await jwtTokenManager.decodePayload('mock_token');
      expect(payload).toEqual({ username: 'dicoding' });
    });
  });
});
