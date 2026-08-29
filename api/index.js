const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

let app;

module.exports = async (req, res) => {
  try {
    if (!app) {
      const server = await createServer(container);
      app = server.app;
    }

    return new Promise((resolve, reject) => {
      res.on('finish', resolve);
      res.on('close', resolve);
      res.on('error', (err) => {
        console.error('Response stream error:', err);
        reject(err);
      });
      app(req, res);
    });
  } catch (error) {
    console.error('Serverless Execution Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Terjadi kesalahan pada server',
    });
  }
};
