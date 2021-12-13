const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RegisteredThread = require('../../../Domains/thread/entities/RegisteredThread');
const RegisterThread = require('../../../Domains/thread/entities/RegisterThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });
  afterAll(async () => {
    await pool.end();
  });

  describe('add Thread Function', () => {
    it('should persist register thread and return registered thread correctly', async () => {
      const registerThread = new RegisterThread({
        title: 'Ini adalah Thread',
        body: 'Ini adalah isi dari Body',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      await threadRepositoryPostgres.addThread(owner, registerThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return registered threads correctly', async () => {
      const registerThread = new RegisterThread({
        title: 'Ini adalah Thread',
        body: 'Ini adalah Body Thread',
      });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const registeredThread = await threadRepositoryPostgres.addThread(
        owner,
        registerThread
      );

      expect(registeredThread).toStrictEqual(
        new RegisteredThread({
          id: 'thread-123',
          title: 'Ini adalah Thread',
          body: 'Ini adalah Body Thread',
          owner: 'user-123',
        })
      );
    });
  });

  describe('verify Thread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-0')
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when thread exist', async () => {
      const payload = {
        id: 'thread-1234',
        title: ' ini tittle',
        body: 'ini body',
        owner: 'user-123',
      };
      await UsersTableTestHelper.addUser({ id: payload.owner });
      await ThreadsTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-1234')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
  describe('get detail Thread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      await expect(
        threadRepositoryPostgres.getDetailThread('thread-0')
      ).rejects.toThrowError(NotFoundError);
    });
    it('should return object correctly', async () => {
      const datetime = new Date().toISOString();
      const payload = {
        id: 'thread-123',
        title: ' ini tittle',
        body: 'ini body',
        owner: 'user-321',
        date: datetime,
      };

      const userPayload = [
        {
          id: 'user-123',
          username: 'jhondoe',
        },
        {
          id: 'user-321',
          username: 'dicoding',
        },
      ];

      const commentPayload = [
        {
          id: 'comment-123',
          owner: 'user-123',
          content: 'sebuah comment',
          thread: 'thread-123',
          isdelete: false,
          date: datetime,
        },
        {
          id: 'comment-321',
          owner: 'user-321',
          thread: 'thread-123',
          content: 'sebuah comment',
          isdelete: true,
          date: datetime,
        },
      ];

      const expectedReturnValue = {
        thread: {
          id: payload.id,
          title: payload.title,
          body: payload.body,
          date: payload.date,
          username:
            payload.owner == userPayload[0].id
              ? userPayload[0].username
              : userPayload[1].username,

          comments: [
            {
              id: commentPayload[0].id,
              username:
                commentPayload[0].owner == userPayload[0].id
                  ? userPayload[0].username
                  : userPayload[1].username,
              date: commentPayload[0].date,
              content: commentPayload[0].isdelete
                ? '**komentar telah dihapus**'
                : commentPayload[0].content,
            },
            {
              id: commentPayload[1].id,
              username:
                commentPayload[1].owner == userPayload[0].id
                  ? userPayload[0].username
                  : userPayload[1].username,
              date: commentPayload[1].date,
              content: commentPayload[1].isdelete
                ? '**komentar telah dihapus**'
                : commentPayload[1].content,
            },
          ],
        },
      };
      await UsersTableTestHelper.addUser(userPayload[0]);
      await UsersTableTestHelper.addUser(userPayload[1]);
      await ThreadsTableTestHelper.addThread(payload);
      await CommentsTableTestHelper.addComment(commentPayload[0]);
      await CommentsTableTestHelper.addComment(commentPayload[1]);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      const result = await threadRepositoryPostgres.getDetailThread(payload.id);
      expect(result.id).toStrictEqual(expectedReturnValue.thread.id);
    });
  });
});
