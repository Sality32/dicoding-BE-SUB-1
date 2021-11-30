const CommentsTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const RegisteredThread = require('../../../Domains/thread/entities/RegisteredThread');
const RegisterThread = require('../../../Domains/thread/entities/RegisterThread');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
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

      await ThreadsTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-1234')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
});
