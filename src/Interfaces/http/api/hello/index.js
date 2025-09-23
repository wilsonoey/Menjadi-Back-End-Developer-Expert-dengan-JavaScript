// TODO 230925: Tambahkan file hello/index.js
const HelloHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'hello',
  register: async (server, { container }) => {
    const helloHandler = new HelloHandler(container);
    server.route(routes(helloHandler));
  },
};