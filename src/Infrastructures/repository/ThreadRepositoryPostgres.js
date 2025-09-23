const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');

class ThreadRepositoryPostgres extends ThreadRepository {
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
  async verifyAvailableThreadById(threadId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }

    const thread = await this._models.Thread.findOne({
      where: { id: threadId }
    });

    if (!thread) {
      throw new NotFoundError('THREAD.NOT_FOUND');
    }
  }

  // TODO 100925: Implementasikan Sequelize ORM
  async addThread(threadData) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    const { title, body, owner } = threadData;
    const id = `thread-${this._idGenerator()}`;

    const createdThread = await this._models.Thread.create({
      id,
      title,
      body,
      owner
    });

    // Extract plain data values from Sequelize model instance
    const threadDataValues = createdThread.get({ plain: true });

    return new AddedThread({
      id: threadDataValues.id,
      title: threadDataValues.title,
      owner: threadDataValues.owner
    });
  }

  // TODO 110925: Implementasikan Sequelize ORM
  async getThreadById(threadId) {
    if (!this._models) {
      throw new Error('Sequelize models not available');
    }
    // TODO 120925: Ganti findAll dengan findOne untuk mendapatkan satu thread
    const thread = await this._models.Thread.findOne({
      where: { id: threadId },
      include: [
        { model: this._models.User, as: 'user', attributes: ['username'] }
      ],
      attributes: ['id', 'title', 'body', 'date'],
    });

    // TODO 120925: Throw NotFoundError if thread doesn't exist
    if (!thread) {
      throw new NotFoundError('THREAD.NOT_FOUND');
    }

    // TODO 120925: Convert to plain object and flatten username
    const threadData = thread.get({ plain: true });

    // UNUSED 120925: Normalize date to JS Date object to make comparisons consistent
    // TODO 120925: Flatten username from nested user object, if present
    const username = threadData.user && threadData.user.username ? threadData.user.username : undefined;

    return {
      id: threadData.id,
      title: threadData.title,
      body: threadData.body,
      date: threadData.date,
      username,
    };
  }
}

module.exports = ThreadRepositoryPostgres;