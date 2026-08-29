const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

let serverInstance;

module.exports = async (req, res) => {
  if (!serverInstance) {
    serverInstance = await createServer(container);
  }
  serverInstance.app(req, res);
};
