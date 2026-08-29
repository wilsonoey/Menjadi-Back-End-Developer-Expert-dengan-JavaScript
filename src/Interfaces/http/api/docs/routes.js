const routes = (handler) => [
  {
    method: 'GET',
    path: '/',
    handler: handler.getRootHandler,
  },
  {
    method: 'GET',
    path: '/docs',
    handler: handler.getDocsHandler,
  },
  {
    method: 'GET',
    path: '/openapi.json',
    handler: handler.getOpenApiJsonHandler,
  },
];

module.exports = routes;
