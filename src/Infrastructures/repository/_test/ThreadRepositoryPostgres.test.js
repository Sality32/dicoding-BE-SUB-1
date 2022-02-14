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
      function fakeDateGenerator() {
        this.toISOString = () => '2021-11-11';
      }
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
        fakeDateGenerator
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

      function fakeDateGenerator() {
        this.toISOString = () => '2021-11-11';
      }
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
        fakeDateGenerator
      );
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });
      const registeredThread = await threadRepositoryPostgres.addThread(
        owner,
        registerThread
      );
      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(registeredThread).toStrictEqual(
        new RegisteredThread({
          id: 'thread-123',
          title: 'Ini adalah Thread',
          body: 'Ini adalah Body Thread',
          owner: 'user-123',
        })
      );
      expect(threads).toHaveLength(1);
    });
  });

  describe('verify Thread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {}
      );
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
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {}
      );

      await expect(
        threadRepositoryPostgres.verifyThreadExist('thread-1234')
      ).resolves.not.toThrowError(NotFoundError);
    });
  });
  describe('get detail Thread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {}
      );
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

      const userPayload = {
        id: 'user-321',
        username: 'dicoding',
      };

      const expectedReturnValue = {
        thread: {
          id: payload.id,
          title: payload.title,
          body: payload.body,
          date: payload.date,
          username: userPayload.username,
        },
      };
      await UsersTableTestHelper.addUser(userPayload);
      await ThreadsTableTestHelper.addThread(payload);
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        {},
        {}
      );
      const result = await threadRepositoryPostgres.getDetailThread(payload.id);
      expect(result).toStrictEqual(expectedReturnValue.thread);
    });
  });
});
