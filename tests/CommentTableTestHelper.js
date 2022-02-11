/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comments-123',
    content = 'ini content',
    thread = 'thread-123',
    owner = 'user-123',
    isdelete = false,
    date = '2021-11-11',
  }) {
    const query = {
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, content, thread, owner, date, isdelete],
    };
    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    };
    const result = await pool.query(query);
    return result.rows;
  },
  async cleanTable() {
    await pool.query('DELETE FROM comments WHERE 1=1');
  },
  async findCommentDeletedById(id) {
    const is_delete = true;
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND is_delete=$2',
      values: [id, is_delete],
    };
    const result = await pool.query(query);
    return result.rows;
  },
};

module.exports = CommentsTableTestHelper;
