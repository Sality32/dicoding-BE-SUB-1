const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'thread_jwt',
    },
  },
 
];

module.exports = routes;
