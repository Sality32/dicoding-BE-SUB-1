const routes = (handler) => [
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postAddCommentHandler,
    options: {
      auth: 'thread_jwt',
    },
  },
];

module.exports = routes;
