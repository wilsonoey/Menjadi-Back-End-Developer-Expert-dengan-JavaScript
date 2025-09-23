const AddedReply = require('../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
    // TODO 100925: Get access to Sequelize models if using SequelizePool
    if (pool.getModels) {
      this._models = pool.getModels();
    }
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async addReply(replyData) {
    const { commentId, content, owner, threadId } = replyData;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const query = await this._models.Reply.create({
      id,
      content,
      owner,
      commentId,
      threadId,
      date
    });

    return new AddedReply({
      id: query.id,
      content: query.content,
      owner: query.owner
    });
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async verifyAvailableReplyById(replyId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const reply = await this._models.Reply.findOne({
      where: { id: replyId, isDelete: false }
    });

    if (!reply) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async verifyReplyByOwner(replyId, owner) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const reply = await this._models.Reply.findOne({
      where: { id: replyId }
    });

    // UNUSED 210925: Cek apakah reply ada
    if (reply.owner !== owner) {
      throw new AuthorizationError('REPLY.NOT_AUTHORIZED');
    }
  }

  // TODO 110925: Implementasikan Sequelize ORM
  async getRepliesByThreadId(threadId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    // Use Sequelize ORM
    const replies = await this._models.Reply.findAll({
      where: { threadId },
      include: [
        {
          model: this._models.User,
          as: 'user',
          attributes: ['username'],
        },
      ],
      order: [['date', 'ASC']],
      attributes: ['id', 'content', 'date', 'commentId', 'isDelete'],
      raw: false,
    });

    // TODO 130925: Harus hasil murni
    return replies;
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async softDeleteReplyById(replyId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const reply = await this._models.Reply.findOne({
      where: { id: replyId }
    });

    if (!reply) {
      throw new NotFoundError('REPLY.NOT_FOUND');
    }

    // TODO 110925: Perform soft delete by setting isDelete to true
    await reply.update({ isDelete: true });
    // TODO 120925: Return the updated reply data in the format expected by the test
    return [{
      id: reply.id,
      content: reply.content,
      date: reply.date,
      comment_id: reply.commentId,
      is_delete: reply.isDelete,
    }];
  }
}

module.exports = ReplyRepositoryPostgres;