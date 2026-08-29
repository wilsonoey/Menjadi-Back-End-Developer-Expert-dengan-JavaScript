const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    if (pool.getModels) {
      this._models = pool.getModels();
    }
  }

  async addLike(commentId, owner) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const id = `like-${this._idGenerator()}`;
    await this._models.UserCommentLike.create({
      id,
      comment_id: commentId,
      owner,
    });
  }

  async deleteLike(commentId, owner) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    await this._models.UserCommentLike.destroy({
      where: {
        comment_id: commentId,
        owner,
      },
    });
  }

  async verifyLikeStatus(commentId, owner) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const like = await this._models.UserCommentLike.findOne({
      where: {
        comment_id: commentId,
        owner,
      },
    });

    return !!like;
  }

  async getLikeCountByCommentId(commentId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    return this._models.UserCommentLike.count({
      where: {
        comment_id: commentId,
      },
    });
  }

  async getLikeCountsByCommentIds(commentIds) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    if (!commentIds || commentIds.length === 0) {
      return {};
    }

    const allLikes = await this._models.UserCommentLike.findAll({
      where: {
        comment_id: commentIds,
      },
      raw: true,
    });

    const counts = {};
    commentIds.forEach((id) => {
      counts[id] = 0;
    });

    allLikes.forEach((like) => {
      const cId = like.comment_id || like.commentId;
      if (counts[cId] !== undefined) {
        counts[cId] += 1;
      } else {
        counts[cId] = 1;
      }
    });

    return counts;
  }
}

module.exports = LikeRepositoryPostgres;
