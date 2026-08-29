const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

let serverInstance;

const handler = async (req, res) => {
  if (!serverInstance) {
    serverInstance = await createServer(container);
  }
  return serverInstance.app(req, res);
};

module.exports = handler;
