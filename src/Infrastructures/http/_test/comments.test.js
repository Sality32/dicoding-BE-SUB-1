const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');

describe('endpoint /threads/{threadid}/comments', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('when POST /threads/{threadid}/comments', () => {
    it('should response 201 and added comment', async () => {
      const payload = {
        content: 'inicontent',
      };
      const thread = {
        id: 'thread-123',
        title: 'Ini Thread',
        body: 'INI ADALAH ISI DARI THREAD',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThread(thread);
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.content).toEqual(payload.content);
    });
    it('should response 401 when not authorize', async () => {
      const payload = {
        content: 'ini content',
      };
      const thread = {
        id: 'thread-123',
        title: 'Ini Thread',
        body: 'INI ADALAH ISI DARI THREAD',
        owner: 'user-123',
      };
      await ThreadsTableTestHelper.addThread(thread);
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments',
        method: 'POST',
        payload: payload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread not found', async () => {
      const payload = {
        content: 'test',
      };

      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);

      const response = await server.inject({
        url: '/threads/thread-12312/comments',
        method: 'POST',
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 400 when bad payload', async () => {
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ id: 'thread-2' });
      const response = await server.inject({
        url: '/threads/thread-2/comments',
        method: 'POST',
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 400 when bad payload', async () => {
      const payload = {
        content: 123,
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      const server = await createServer(container);
      await ThreadsTableTestHelper.addThread({ id: 'thread-2' });
      const response = await server.inject({
        url: '/threads/thread-2/comments',
        method: 'POST',
        payload: payload,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
    });
  });
  describe('when DELETE /threads/{threadid}/comments/{commentid}', () => {
    it('should response 401 when not authorize', async () => {
      const useCasePayload = {
        thread: 'thread-123',
        comment: 'comment-123',
      };
      await ThreadsTableTestHelper.addThread({ id: useCasePayload.thread });
      await CommentsTableTestHelper.addComment({ id: useCasePayload.comment });
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/commen-123',
        method: 'DELETE',
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual('Missing authentication');
    });
    it('should response 404 when comment not found', async () => {
      const useCasePayload = {
        thread: 'thread-123',
        comment: 'comment-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: useCasePayload.thread,
      });
      await CommentsTableTestHelper.addComment({
        id: useCasePayload.comment,
      });
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/commen-12',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 403 when user delete another user comment', async () => {
      const useCasePayload = {
        owner: 'user-12',
        thread: 'thread-123',
        comment: 'comment-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: useCasePayload.thread,
        owner: useCasePayload.owner,
      });
      await CommentsTableTestHelper.addComment({
        id: useCasePayload.comment,
        owner: useCasePayload.owner,
      });
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
    });
    it('should response 200', async () => {
      const useCasePayload = {
        owner: 'user-123',
        thread: 'thread-123',
        comment: 'comment-123',
      };
      const accessToken = await ServerTestHelper.getAccessToken();
      await ThreadsTableTestHelper.addThread({
        id: useCasePayload.thread,
        owner: useCasePayload.owner,
      });
      await CommentsTableTestHelper.addComment({
        id: useCasePayload.comment,
        owner: useCasePayload.owner,
      });
      const server = await createServer(container);
      const response = await server.inject({
        url: '/threads/thread-123/comments/comment-123',
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
