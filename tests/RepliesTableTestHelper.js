// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const { Reply } = require('../src/Infrastructures/database/models');
const SequelizePool = require('../src/Infrastructures/database/SequelizePool');

const pool = new SequelizePool();
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists
// TODO 110925: Implementasikan ORM Sequelize
const RepliesTableTestHelper = {
  // TODO 220925: Ubah constructor function addReply
  async addReply({
    id,
    content = 'Example Reply',
    owner,
    commentId,
    threadId = 'thread-123',
    date = new Date().toISOString()
  }) {
    const query = await Reply.create({
      id,
      content,
      owner,
      commentId,
      threadId,
      date
    });

    return query;
  },

  async findReplyById(replyId) {
    // TODO 110925:Return array so tests using .toHaveLength(1) work
    const query = await Reply.findAll({
      where: { id: replyId },
      raw: true, // TODO 110925: return plain objects
    });
    // UNUSED 220925: Ensure the return is always an array
    return [query];
  },

  async cleanTable() {
    await Reply.destroy({
      where: {},
      truncate: true,
      // TODO 110925: Gunakan opsi 'cascade' jika diperlukan berdasarkan relasi tabel
      cascade: true,
    });
  },
};

module.exports = RepliesTableTestHelper;