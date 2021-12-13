const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ForbiddenError = require('../../../Commons/exceptions/ForbiddenError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RegisterComment = require('../../../Domains/comment/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comment/entities/RegisteredComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('add comment function', () => {
    it('should return registered comment correctly', async () => {
      const registThread = {
        id: 'thread-123',
        title: ' ini tittle',
        body: 'ini body',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: registThread.owner });
      await UsersTableTestHelper.addUser({ id: 'user-0', username: 'test-0' });
      await ThreadsTableTestHelper.addThread(registThread);
      const registerComment = new RegisterComment({
        content: 'ini content',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const registeredComment = await commentRepositoryPostgres.addComment(
        'user-0',
        'thread-123',
        registerComment
      );
      expect(registeredComment).toStrictEqual(
        new RegisteredComment({
          id: 'comment-123',
          content: registerComment.content,
          owner: 'user-0',
        })
      );
    });
  });
  describe('verify comment exist function', () => {
    it('should throw error when comment not found', async () => {
      const commentId = 'comment-123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentExist(commentId)
      ).rejects.toThrowError(NotFoundError);
    });
    it('should not throw when comment exist', async () => {
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.verifyCommentExist(payload.commentId)
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
  describe('get Comment by Thread Id function', () => {
    it('should not throw when comment exist', async () => {
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
        commentId2: 'comment-124',
      };
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
      });
      await CommentsTableTestHelper.addComment({
        id: payload.commentId2,
        thread: payload.threadId,
        owner: payload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentResult =
        await commentRepositoryPostgres.getCommentByThreadId(payload.threadId);
      expect(commentResult.length).toEqual(2);
    });
  });
  describe('delete comment function', () => {
    it('should throw Forbidden error when different owner', async () => {
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await expect(
        commentRepositoryPostgres.deleteComment(
          payload.commentId,
          'user-0',
          payload.threadId
        )
      ).rejects.toThrowError(ForbiddenError);
    });
    it('should return object correctly', async () => {
      const payload = {
        userId: 'user-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.userId });
      await ThreadsTableTestHelper.addThread({
        id: payload.threadId,
        owner: payload.userId,
      });

      await CommentsTableTestHelper.addComment({
        id: payload.commentId,
        thread: payload.threadId,
        owner: payload.userId,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment(
        payload.commentId,
        payload.userId,
        payload.threadId
      );
      const result = await CommentsTableTestHelper.findCommentDeletedById(
        payload.commentId
      );

      expect(result).toHaveLength(1);
    });
  });
});
