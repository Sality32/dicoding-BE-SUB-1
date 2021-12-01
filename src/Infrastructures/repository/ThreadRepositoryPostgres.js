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
      text:
        'SELECT threads.id, threads.title, threads.body, threads.date, s.username FROM threads ' +
        'LEFT JOIN users s ON threads.owner = s.id ' +
        'WHERE threads.id=$1',
      values: [id],
    };
    const result = await this._pool.query(query);
    const data = result.rows[0];
    const query2 = {
      text:
        'SELECT cm.id, cm.content, cm.date, cm.is_delete, s.username FROM "comments" cm ' +
        'LEFT JOIN users s ON cm."owner" = s.id ' +
        'LEFT JOIN threads th ON cm.thread = th.id ' +
        'WHERE th.id=$1 ' +
        'ORDER BY cm.date',
      values: [id],
    };
    const result2 = await this._pool.query(query2);
    const thread = {
      id: data.id,
      title: data.title,
      body: data.body,
      date: data.date,
      username: data.username,
      comments: [],
    };
    result2.rows.forEach((data) => {
      thread.comments.push({
        id: data.id,
        username: data.username,
        date: data.date,
        content: data.is_delete ? '**komentar telah dihapus**' : data.content,
      });
    });

    const response = { thread: thread };
    return response;
  }
}
module.exports = ThreadRepositoryPostgres;
