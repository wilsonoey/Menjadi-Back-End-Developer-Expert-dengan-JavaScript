const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

let serverPromise;

module.exports = async (req, res) => {
  if (!serverPromise) {
    serverPromise = createServer(container);
  }
  const server = await serverPromise;
  return server.app(req, res);
};
