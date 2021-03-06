const ForbiddenError = require('../../Commons/exceptions/ForbiddenError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comment/CommentRepository');
const RegisteredComment = require('../../Domains/comment/entities/RegisteredComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator, dateGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    this._dateGenerator = dateGenerator;
  }
  async addComment(owner, threadId, registerComment) {
    const { content } = registerComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new this._dateGenerator().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, threadId, owner, date],
    };
    const result = await this._pool.query(query);
    return new RegisteredComment({ ...result.rows[0] });
  }
  async verifyCommentExist(id) {
    const query = {
      text: 'SELECT content FROM comments WHERE id=$1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (result.rows == 0) {
      throw new NotFoundError('comment tidak ditemukan');
    }
  }
  async deleteComment(id, owner, thread) {
    const query = {
      text: 'UPDATE comments SET is_delete=true WHERE "owner"=$2 AND id=$1  AND thread=$3 RETURNING id, content, owner',
      values: [id, owner, thread],
    };
    const result = await this._pool.query(query);
    if (result.rows == 0) {
      throw new ForbiddenError('tidak bisa menghapus comment dari user lain');
    }
  }
  async getCommentByThreadId(threadId) {
    const query = {
      text: `SELECT comments.id, comments.date, comments.content, comments.is_delete, users.username 
            FROM comments
            LEFT JOIN users ON comments.owner = users.id
            WHERE comments.thread = $1 `,
      values: [threadId],
    };
    const result = await this._pool.query(query);
    return result.rows;
  }
}
module.exports = CommentRepositoryPostgres;
