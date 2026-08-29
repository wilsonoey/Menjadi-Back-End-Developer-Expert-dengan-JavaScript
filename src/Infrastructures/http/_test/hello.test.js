const container = require('../../container');
const createServer = require('../createServer');

describe('/hello endpoint', () => {
  describe('when GET /hello', () => {
    it('should response 200 and return hello world message', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/hello',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      // Intentionally failing assertion for CI failure scenario demonstration
      expect(responseJson.message).toEqual('Hello Failing Scenario!');
    });
  });
});
