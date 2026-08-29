const express = require('express');

const app = express();
let serverPromise;

app.use(async (req, res, next) => {
  try {
    if (!serverPromise) {
      const container = require('../src/Infrastructures/container');
      const createServer = require('../src/Infrastructures/http/createServer');
      serverPromise = createServer(container);
    }
    const server = await serverPromise;
    return server.app(req, res, next);
  } catch (err) {
    console.error('Serverless Runtime Error:', err);
    res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error',
      stack: err.stack,
    });
  }
});

module.exports = app;
