/* istanbul ignore file */
const { UserCommentLike } = require('../src/Infrastructures/database/models');

const LikesTableTestHelper = {
  async addLike({
    id = 'like-123',
    commentId = 'comment-123',
    owner = 'user-123',
  }) {
    await UserCommentLike.create({
      id,
      comment_id: commentId,
      owner,
    });
  },

  async findLike({ commentId = 'comment-123', owner = 'user-123' }) {
    const like = await UserCommentLike.findOne({
      where: {
        comment_id: commentId,
        owner,
      },
      raw: true,
    });

    return like;
  },

  async cleanTable() {
    await UserCommentLike.destroy({
      where: {},
      truncate: true,
      cascade: true,
    });
  },
};

module.exports = LikesTableTestHelper;
