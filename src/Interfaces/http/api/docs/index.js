const DocsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'docs',
  version: '1.0.0',
  register: async (server) => {
    const docsHandler = new DocsHandler();
    server.route(routes(docsHandler));
  },
};
