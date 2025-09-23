// TODO 230925: Tambahkan file hello/handler.js
class HelloHandler {
  constructor(container) {
    this._container = container;
  }

  getHelloHandler = async (request, h) => {
    const response = h.response({
      status: 'success',
      message: 'Hello World!',
    });
    response.code(200);
    return response;
  }
}

module.exports = HelloHandler;