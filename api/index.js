require('pg');
require('pg-hstore');
const express = require('express');
const createServer = require('../src/Infrastructures/http/createServer');
const container = require('../src/Infrastructures/container');

const app = express();
let serverInstance;

app.use(async (req, res, next) => {
  try {
    if (!serverInstance) {
      serverInstance = await createServer(container);
    }
    return serverInstance.app(req, res, next);
  } catch (err) {
    return next(err);
  }
});

module.exports = app;
