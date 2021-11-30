const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const RegisterComment = require('../../../Domains/comment/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comment/entities/RegisteredComment');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

describe('CommentRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });
  describe('add comment function', () => {
    it('should return registered comment correctly', async () => {
      const registThread = {
        id: 'thread-00',
        title: ' ini tittle',
        body: 'ini body',
        owner: 'user-123',
      };

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
});
