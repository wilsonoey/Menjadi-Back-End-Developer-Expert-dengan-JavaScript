/* istanbul ignore file */
// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const { Comment } = require('../src/Infrastructures/database/models');
const SequelizePool = require('../src/Infrastructures/database/SequelizePool');

const pool = new SequelizePool();
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists

// TODO 110925: Implementasikan ORM Sequelize
const CommentsTableTestHelper = {
  // TODO 220925: Ubah constructor function addComment
  async addComment({
    id, 
    content = 'Example Comment', 
    owner,
    threadId = 'thread-123', 
    date = new Date().toISOString(),
  }) {
    const query = await Comment.create({
      id,
      content,
      owner,
      thread_id: threadId, // TODO 120925: Use correct field name for database
      date,
    });

    // TODO 210925: Ensure the return is always a plain object
    return query;
  },

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
      truncate: true,
      // TODO 110925: Gunakan opsi 'cascade' jika diperlukan berdasarkan relasi tabel
      cascade: true,
    });
  },
};

module.exports = CommentsTableTestHelper;