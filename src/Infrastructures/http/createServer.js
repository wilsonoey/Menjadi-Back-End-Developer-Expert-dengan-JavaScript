const express = require('express');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const ClientError = require('../../Commons/exceptions/ClientError');
const DomainErrorTranslator = require('../../Commons/exceptions/DomainErrorTranslator');
const users = require('../../Interfaces/http/api/users');
const authentications = require('../../Interfaces/http/api/authentications');
const threads = require('../../Interfaces/http/api/threads');
const comments = require('../../Interfaces/http/api/comments');
const replies = require('../../Interfaces/http/api/replies');
const hello = require('../../Interfaces/http/api/hello');
const docs = require('../../Interfaces/http/api/docs');

let supertestLib;
try {
  supertestLib = require('supertest');
} catch (e) {
  // lazy loaded if needed
}

const threadsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { default: false },
  message: {
    status: 'fail',
    message: 'Terlalu banyak permintaan, silakan coba lagi nanti',
  },
});

const createServer = async (container) => {
  const app = express();
  app.use(express.json());

  // Limit access: 90 requests per minute on /threads and sub-paths
  app.use('/threads', threadsLimiter);

  const authStrategies = {};

  const server = {
    app,
    info: {
      host: process.env.HOST || 'localhost',
      port: process.env.PORT || 5000,
      uri: `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 5000}`,
    },
    auth: {
      strategy: (name, scheme, options) => {
        authStrategies[name] = options;
      },
    },
    route: (routes) => {
      const routeList = Array.isArray(routes) ? routes : [routes];
      routeList.forEach((route) => {
        const method = route.method.toLowerCase();
        const expressPath = route.path.replace(/\{(\w+)\}/g, ':$1');

        app[method](expressPath, async (req, res) => {
          // Authentication check
          if (route.options && route.options.auth === 'forum_api_jwt') {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
              return res.status(401).json({
                statusCode: 401,
                error: 'Unauthorized',
                status: 'fail',
                message: 'Missing authentication',
              });
            }

            const token = authHeader.split(' ')[1];
            try {
              const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
              const payload = (decoded && decoded.decoded && decoded.decoded.payload)
                ? decoded.decoded.payload
                : (decoded.payload || decoded);

              req.auth = {
                credentials: {
                  id: payload.id,
                  username: payload.username,
                },
              };
            } catch (err) {
              return res.status(401).json({
                statusCode: 401,
                error: 'Unauthorized',
                status: 'fail',
                message: 'Invalid token',
              });
            }
          }

          // Build request object for handler
          const request = {
            payload: req.body,
            params: req.params,
            query: req.query,
            headers: req.headers,
            auth: req.auth || { credentials: {} },
          };

          // Build h response toolkit
          let responseCode = 200;
          let responseData = null;
          const h = {
            response: (data) => {
              responseData = data;
              const resp = {
                code: (code) => {
                  responseCode = code;
                  return resp;
                },
                header: (headerName, headerValue) => {
                  res.setHeader(headerName, headerValue);
                  return resp;
                },
              };
              return resp;
            },
            continue: null,
          };

          try {
            const handlerResult = await route.handler(request, h);
            if (responseData !== null) {
              if (typeof responseData === 'string' && res.getHeader('content-type') && res.getHeader('content-type').includes('text/html')) {
                return res.status(responseCode).send(responseData);
              }
              if (typeof responseData === 'string') {
                return res.status(responseCode).send(responseData);
              }
              return res.status(responseCode).json(responseData);
            }
            if (handlerResult && typeof handlerResult === 'object' && handlerResult.statusCode) {
              return res.status(handlerResult.statusCode).json(handlerResult.data);
            }
            return res.status(responseCode).send(handlerResult);
          } catch (error) {
            const translatedError = DomainErrorTranslator.translate(error);
            if (translatedError instanceof ClientError) {
              return res.status(translatedError.statusCode).json({
                status: 'fail',
                message: translatedError.message,
              });
            }

            return res.status(500).json({
              status: 'error',
              message: translatedError.message || 'terjadi kegagalan pada server kami',
            });
          }
        });
      });
    },
    register: async (plugins) => {
      const pluginList = Array.isArray(plugins) ? plugins : [plugins];
      for (const item of pluginList) {
        if (item.plugin && typeof item.plugin.register === 'function') {
          await item.plugin.register(server, item.options || {});
        }
      }
    },
    ext: () => {},
    start: () => new Promise((resolve) => {
      const host = process.env.HOST || 'localhost';
      const port = process.env.PORT || 5000;
      server._httpServer = app.listen(port, host, () => {
        server.info.uri = `http://${host}:${port}`;
        resolve(server);
      });
    }),
    stop: () => new Promise((resolve) => {
      if (server._httpServer) {
        server._httpServer.close(resolve);
      } else {
        resolve();
      }
    }),
    inject: async ({
      method = 'GET',
      url = '/',
      payload,
      headers = {},
    }) => {
      const st = supertestLib || require('supertest');
      const supertestReq = st(app)[method.toLowerCase()](url);

      Object.entries(headers).forEach(([key, value]) => {
        supertestReq.set(key, value);
      });

      if (payload !== undefined) {
        supertestReq.send(payload);
      }

      const res = await supertestReq;
      return {
        statusCode: res.status,
        headers: res.headers,
        payload: typeof res.text === 'string' ? res.text : JSON.stringify(res.body),
        rawPayload: res.body,
      };
    },
  };

  // Register all plugins
  await server.register([
    {
      plugin: users,
      options: { container },
    },
    {
      plugin: authentications,
      options: { container },
    },
    {
      plugin: threads,
      options: { container },
    },
    {
      plugin: comments,
      options: { container },
    },
    {
      plugin: replies,
      options: { container },
    },
    {
      plugin: hello,
      options: { container },
    },
    {
      plugin: docs,
      options: { container },
    },
  ]);

  // Fallback 404 handler for unregistered routes
  app.use((req, res) => {
    res.status(404).json({
      status: 'fail',
      message: 'Not Found',
    });
  });

  return server;
};

module.exports = createServer;
