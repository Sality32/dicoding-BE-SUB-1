const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const RegisteredThread = require('../../Domains/thread/entities/RegisteredThread');
const ThreadRepository = require('../../Domains/thread/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(owner, registerThread) {
    const { title, body } = registerThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date(Date.now()).toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, body, "owner"',
      values: [id, title, body, owner, date],
    };

    const result = await this._pool.query(query);
    return new RegisteredThread({ ...result.rows[0] });
  }
  async verifyThreadExist(threadId) {
    const query = {
      text: 'SELECT title FROM threads WHERE id = $1',
      values: [threadId],
    };
    const result = await this._pool.query(query);

    if (result.rowCount == 0) {
      throw new NotFoundError('thread tidak ditemukan');
    }
    return result.rows[0];
  }
  async getDetailThread(id) {
    const query = {
      text: `SELECT threads.id, threads.title, threads.body, threads.date, users.username 
              FROM threads
              LEFT JOIN users ON threads.owner = users.id
              WHERE threads.id = $1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length == 0) {
      throw new NotFoundError('Gagal mendapatkan Detail Threads');
    }
    return result.rows[0];
  }
}
module.exports = ThreadRepositoryPostgres;
