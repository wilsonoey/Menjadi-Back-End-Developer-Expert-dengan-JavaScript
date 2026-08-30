/* istanbul ignore file */
const { Comment } = require('../src/Infrastructures/database/models');
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists

// TODO 110925: Implementasikan ORM Sequelize
const CommentsTableTestHelper = {
  // TODO 220925: Ubah constructor function addComment
  async addComment({
    id = 'comment-123',
    content = 'Example Comment',
    owner = 'user-123',
    threadId = 'thread-123',
    date = new Date().toISOString(),
  }) {
    const query = await Comment.create({
      id,
      content,
      owner,
      threadId,
      thread_id: threadId,
      date,
    });

    return query;
  },

  /**
   * @returns {Promise<any[]>}
   */
  async findCommentById(commentId) {
    // TODO 110925: Return array so tests using .toHaveLength(1) work
    const query = await Comment.findAll({
      where: { id: commentId },
      raw: true, // TODO 110925: return plain objects
    });
    // TODO 220925: Kembalikan pure ORM (findAll seharusnya sudah mengembalikan array)
    return query;
  },

  async findCommentByIdIsDeleteFalse(commentId) {
    const query = await Comment.findAll({
      where: { id: commentId, is_delete: false },
      raw: true, // TODO 110925: return plain objects
    });
    // TODO 220925: Kembalikan pure ORM (findAll seharusnya sudah mengembalikan array)
    return query;
  },

  async cleanTable() {
    await Comment.destroy({
      where: {},
      truncate: false,
    });
  },
};

module.exports = CommentsTableTestHelper;
