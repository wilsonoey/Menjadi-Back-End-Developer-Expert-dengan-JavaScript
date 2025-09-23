const AddedComment = require('../../Domains/comments/entities/AddedComment');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/comments/CommentRepository');

class CommentRepositoryPostgres extends CommentRepository {
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
  async addComment(commentData) {
    const { threadId, content, owner } = commentData;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    
    const createdComment = await this._models.Comment.create({
      id,
      content,
      owner,
      thread_id: threadId, // Use correct field name for database
      date
    });
    
    // TODO 110925: Ensure we convert Sequelize instance to plain object and return AddedComment
    const plain = createdComment.get ? createdComment.get({ plain: true }) : createdComment;

    // TODO 110925: Return the AddedComment entity
    // TODO 160925: Sesuaikan properti sesuai dengan entity AddedComment
    // TODO 180925: Nilai kembalian dari fungsi addComment di sini juga sudah sama dengan nilai kembalian yang diharapkan oleh fungsi addComment pada file Domains/comments/CommentRepository.js
    return new AddedComment({ 
      id: plain.id,
      content: plain.content,
      owner: plain.owner
    });
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async verifyAvailableCommentById(commentId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const comment = await this._models.Comment.findOne({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async verifyCommentByOwner(commentId, owner) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    const comment = await this._models.Comment.findOne({
      where: { id: commentId, owner: owner }
    });

    if (!comment) {
      throw new AuthorizationError('komentar ini bukan milik anda');
    }
  }

  // TODO 100925: Implementasikan Sequelize ORM - Add missing softDeleteCommentById method
  async softDeleteCommentById(commentId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const comment = await this._models.Comment.findOne({
      where: { id: commentId }
    });

    if (!comment) {
      throw new NotFoundError('COMMENT.NOT_FOUND');
    }

    // Perform soft delete by setting is_delete to true
    await comment.update({ is_delete: true });
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async getCommentsByThreadId(threadId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    // TODO 130925: Fetch comments with associated usernames and order by date
    const comments = await this._models.Comment.findAll({
      where: { thread_id: threadId },
      attributes: ['id', 'content', 'date', 'is_delete', 'owner', 'thread_id'],
      include: [
        {
          model: this._models.User,
          as: 'user',
          attributes: ['username'],
        },
      ],
      order: [['date', 'ASC']], // Pastikan urutan ASC by date
    });

    return comments;
  }
}

module.exports = CommentRepositoryPostgres;