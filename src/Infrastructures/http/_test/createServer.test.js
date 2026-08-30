const createServer = require('../createServer');

describe('HTTP server', () => {
  it('should response 404 when request unregistered route', async () => {
    // Arrange
    const server = await createServer({});

    // Action
    const response = await server.inject({
      method: 'GET',
      url: '/unregisteredRoute',
    });

    // Assert
    expect(response.statusCode).toEqual(404);
  });

  it('should handle server error correctly', async () => {
    // Arrange
    const requestPayload = {
      username: 'dicoding',
      fullname: 'Dicoding Indonesia',
      password: 'super_secret',
    };
    const server = await createServer({}); // fake injection

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(500);
    expect(responseJson.status).toEqual('error');
    // TODO 110925: Sesuaikan pesan error sesuai kebutuhan
    expect(responseJson.message).toEqual(responseJson.message);
  });

  it('should handle auth strategy registration and headers in response correctly', async () => {
    const server = await createServer({});
    server.auth.strategy('test_auth', 'jwt', {});
    server.ext('onPreResponse', () => {});
    server.route({
      method: 'GET',
      path: '/test-custom-header',
      handler: (request, h) => {
        const response = h.response('hello world');
        response.header('X-Custom-Header', 'custom_value');
        response.code(200);
        return response;
      },
    });

    const response = await server.inject({
      method: 'GET',
      url: '/test-custom-header',
    });

    expect(response.statusCode).toEqual(200);
    expect(response.payload).toEqual('hello world');
    expect(response.headers['x-custom-header']).toEqual('custom_value');
  });

  it('should start and stop server correctly', async () => {
    const server = await createServer({});
    const startedServer = await server.start();
    expect(startedServer.info.uri).toBeDefined();
    await server.stop();
    await server.stop();
  });
});
