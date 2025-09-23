// TODO 230925: Tambahkan file hello/routes.js
const routes = (handler) => ([
  {
    method: 'GET',
    path: '/hello',
    handler: handler.getHelloHandler,
  },
]);

module.exports = routes;