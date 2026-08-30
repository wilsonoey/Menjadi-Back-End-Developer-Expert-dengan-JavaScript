/* istanbul ignore file */

const { Reply } = require('../src/Infrastructures/database/models');
// UNUSED 220925: Ensure compatibility with expectations that pool.end() exists
// TODO 110925: Implementasikan ORM Sequelize
const RepliesTableTestHelper = {
  // TODO 220925: Ubah constructor function addReply
  async addReply({
    id = 'reply-123',
    content = 'Example Reply',
    owner = 'user-123',
    commentId = 'comment-123',
    threadId = 'thread-123',
    date = new Date().toISOString(),
  }) {
    const query = await Reply.create({
      id,
      content,
      owner,
      commentId,
      threadId,
      date,
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
      truncate: false,
    });
  },
};

module.exports = RepliesTableTestHelper;
