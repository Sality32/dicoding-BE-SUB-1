const CommentRepository = require('../../Domains/comment/CommentRepository');
const RegisteredComment = require('../../Domains/comment/entities/RegisteredComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }
  async addComment(owner, threadId, registerComment) {
    const { content } = registerComment;
    const id = `comment-${this._idGenerator()}`;

    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4) RETURNING id, content, owner',
      values: [id, content, threadId, owner],
    };
    const result = await this._pool.query(query);
    return new RegisteredComment({ ...result.rows[0] });
  }
}
module.exports = CommentRepositoryPostgres;
