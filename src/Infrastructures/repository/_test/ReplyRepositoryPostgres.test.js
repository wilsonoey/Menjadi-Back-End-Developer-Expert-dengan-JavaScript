const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const SequelizePool = require('../../database/SequelizePool');

const pool = new SequelizePool();

describe('ReplyRepositoryPostgres', () => {
  // TODO 130925: helper to normalize Sequelize instances to plain objects for assertions
  const normalizeReply = (r) => {
    if (!r) return r;
    if (typeof r.toJSON === 'function') return r.toJSON();
    if (r.dataValues) {
      const obj = { ...r.dataValues };
      if (r.user && r.user.dataValues) obj.user = { ...r.user.dataValues };
      return obj;
    }
    return r;
  };

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // TODO 110925: Implementasikan penutupan koneksi Sequelize jika diperlukan
    await pool.close();
  });

  // TODO 120925: Sesuaikan test berikut jika diperlukan
  describe('ReplyRepositoryPostgres constructor', () => {
    it('should set this._models when pool has getModels method', () => {
      // Arrange
      const pool = {
        getModels: jest.fn().mockReturnValue('models')
      };
      
      // Act
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      
      // Assert
      expect(pool.getModels).toHaveBeenCalled();
      expect(replyRepositoryPostgres._models).toEqual('models');
    });

    it('should not set this._models when pool does not have getModels method', () => {
      // Arrange
      const pool = {};
      
      // Act
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
      
      // Assert
      expect(replyRepositoryPostgres._models).toBeUndefined();
    });
  });

  describe('verifyAvailableReplyById function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReplyById('comment-123'))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should throw NotFoundError if reply not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const replyId = 'reply-000';

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReplyById(replyId))
        .rejects.toThrow(NotFoundError);
    });

    // TODO 180925: New targeted unit test to ensure the NotFoundError branch is covered deterministically
    it('should throw NotFoundError when models exist but reply is not found (mocked)', async () => {
      // Arrange: create fake models where Reply.findOne resolves to null
      const mockFindOne = jest.fn().mockResolvedValue(null);
      const fakeModels = {
        Reply: {
          findOne: mockFindOne,
        },
      };
      const fakePool = {
        getModels: () => fakeModels,
      };
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(fakePool);

      const replyId = 'reply-mocked-000';

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReplyById(replyId))
        .rejects.toThrow(NotFoundError);

      // ensure the mock was called with expected where clause
      expect(mockFindOne).toHaveBeenCalledWith({ where: { id: replyId, isDelete: false } });
    });

    it('should not throw NotFoundError if comment available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      const replyId = 'reply-123';
      // TODO 180925: pass commentId (was incorrectly passed as replyId key)
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyAvailableReplyById(replyId))
        .resolves.not.toThrow(NotFoundError);
    });
  });

  describe('addReply function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const addReply = new AddReply({
        commentId: 'comment-123',
        content: 'Example Reply',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, () => '123');

      // Action & Assert
      await expect(replyRepositoryPostgres.addReply(addReply))
        .rejects.toThrow('Sequelize models not available');
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      const addReply = new AddReply({
        commentId,
        content: 'Example Reply',
        owner: userId,
        threadId,
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);
  
      // Action
      const addedReply = await replyRepositoryPostgres.addReply({
        ...addReply,
        threadId,
      });
  
      // Assert
      const replies = await RepliesTableTestHelper.findReplyById(addedReply.id);
      expect(replies).toHaveLength(1);
      expect(addedReply).toStrictEqual(new AddedReply({
        id: `reply-${fakeIdGenerator()}`,
        content: addReply.content,
        owner: addReply.owner,
      }));
    });
  });

  describe('verifyReplyByOwner function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({});

      // Action & Assert
      // TODO 180925: Ganti dari verifyAvailableReplyById menjadi verifyReplyByOwner
      await expect(replyRepositoryPostgres.verifyReplyByOwner('comment-123'))
        .rejects.toThrow('Sequelize models not available');
    });
    
    it('should throw AuthorizationError if owner is not valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });
      const inValidUserId = 'user-456';

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyByOwner(replyId, inValidUserId))
        .rejects.toThrow(AuthorizationError);
    });

    it('should not throw AuthorizationError if owner is valid', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyByOwner(replyId, userId))
        .resolves.not.toThrow(AuthorizationError);
    });
  });

  describe('getRepliesByThreadId function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({});
      
      // Action & Assert
      await expect(replyRepositoryPostgres.getRepliesByThreadId('comment-123'))
        .rejects.toThrow('Sequelize models not available');
    });
    
    it('should get replies by threadId correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userPayload = {
        id: 'user-123',
        username: 'user123',
      };
      await UsersTableTestHelper.addUser(userPayload);
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userPayload.id });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userPayload.id });
      const replyPayload = {
        id: 'reply-123',
        commentId,
        content: 'Example Reply',
        owner: userPayload.id,
      };
      await RepliesTableTestHelper.addReply(replyPayload);

      // Action
      const repliesResult = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(repliesResult).toBeDefined();
      expect(repliesResult).toHaveLength(1);

      // TODO 130925: Normalize Sequelize instance to plain object for easier assertions
      const plain = normalizeReply(repliesResult[0]);
      expect(plain.id).toEqual(replyPayload.id);
      expect(plain.content).toEqual(replyPayload.content);
      // username is nested under user when using Sequelize include
      expect(plain.user).toBeDefined();
      expect(plain.user.username).toEqual(userPayload.username);
    });

    it('should get empty array when replies by threadId is empty', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });

      // Action
      const repliesResult = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(repliesResult).toBeDefined();
      expect(repliesResult).toHaveLength(0);
    });
  });

  describe('softDeleteReplyById function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres({});
      // Action & Assert
      await expect(replyRepositoryPostgres.softDeleteReplyById('reply-123'))
        .rejects.toThrow('Sequelize models not available');
    });
    
    it('should throw NotFoundError when reply not found or invalid', () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);

      // Action & Assert
      return expect(replyRepositoryPostgres.softDeleteReplyById('reply-000'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should return delete reply correctly', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool);
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId });
      const threadId = 'thread-123';
      await ThreadsTableTestHelper.addThread({ id: threadId, owner: userId });
      const commentId = 'comment-123';
      await CommentsTableTestHelper.addComment({ id: commentId, threadId, owner: userId });
      const replyId = 'reply-123';
      await RepliesTableTestHelper.addReply({ id: replyId, commentId, owner: userId });

      // Action
      // TODO 120925: Tangani hasil penghapusan sesuai dengan yang diharapkan oleh test
      const deleteResult = await replyRepositoryPostgres.softDeleteReplyById(replyId);

      // Assert using returned value (contains is_delete)
      expect(deleteResult).toBeDefined();
      expect(Array.isArray(deleteResult)).toBe(true);
      expect(deleteResult).toHaveLength(1);
      expect(deleteResult[0].id).toBe(replyId);
      expect(deleteResult[0].is_delete).toBe(true);

      // Optional: verify via repository public read method
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);
      const target = replies.find(r => r.id === replyId);
      expect(target).toBeDefined();
      expect(target.dataValues.isDelete).toBe(true);
    });
  });
});