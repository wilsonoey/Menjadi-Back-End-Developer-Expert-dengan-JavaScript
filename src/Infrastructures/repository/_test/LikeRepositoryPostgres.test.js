const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const SequelizePool = require('../../database/SequelizePool');
const LikeRepositoryPostgres = require('../LikeRepositoryPostgres');

describe('LikeRepositoryPostgres', () => {
  jest.setTimeout(30000);

  beforeEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    const pool = new SequelizePool();
    await pool.close();
  });

  describe('addLike function', () => {
    it('should persist like and be found in database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });

      const fakeIdGenerator = () => '123';
      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.addLike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.findLike({ commentId: 'comment-123', owner: 'user-123' });
      expect(like).toBeDefined();
      expect(like.comment_id || like.commentId).toEqual('comment-123');
      expect(like.owner).toEqual('user-123');
    });
  });

  describe('deleteLike function', () => {
    it('should delete like from database', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });

      const fakeIdGenerator = () => '123';
      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await likeRepositoryPostgres.deleteLike('comment-123', 'user-123');

      // Assert
      const like = await LikesTableTestHelper.findLike({ commentId: 'comment-123', owner: 'user-123' });
      expect(like).toBeNull();
    });
  });

  describe('verifyLikeStatus function', () => {
    it('should return true when like exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      await LikesTableTestHelper.addLike({ id: 'like-123', commentId: 'comment-123', owner: 'user-123' });

      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyLikeStatus('comment-123', 'user-123');

      // Assert
      expect(isLiked).toEqual(true);
    });

    it('should return false when like does not exist', async () => {
      // Arrange
      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const isLiked = await likeRepositoryPostgres.verifyLikeStatus('comment-123', 'user-123');

      // Assert
      expect(isLiked).toEqual(false);
    });
  });

  describe('getLikeCountByCommentId function', () => {
    it('should return correct like count', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      await LikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', owner: 'user-456' });

      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});

      // Action
      const count = await likeRepositoryPostgres.getLikeCountByCommentId('comment-123');

      // Assert
      expect(count).toEqual(2);
    });
  });

  describe('getLikeCountsByCommentIds function', () => {
    it('should return empty object if commentIds is empty', async () => {
      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});
      const counts = await likeRepositoryPostgres.getLikeCountsByCommentIds([]);
      expect(counts).toEqual({});
    });

    it('should return like counts grouped by commentIds correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'user1' });
      await UsersTableTestHelper.addUser({ id: 'user-456', username: 'user2' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123', threadId: 'thread-123' });
      await CommentsTableTestHelper.addComment({ id: 'comment-124', owner: 'user-123', threadId: 'thread-123' });
      await LikesTableTestHelper.addLike({ id: 'like-1', commentId: 'comment-123', owner: 'user-123' });
      await LikesTableTestHelper.addLike({ id: 'like-2', commentId: 'comment-123', owner: 'user-456' });

      const pool = new SequelizePool();
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, () => {});
      const counts = await likeRepositoryPostgres.getLikeCountsByCommentIds(['comment-123', 'comment-124', 'comment-125']);
      expect(counts).toEqual({
        'comment-123': 2,
        'comment-124': 0,
        'comment-125': 0,
      });
    });
  });

  describe('when models are not available', () => {
    it('should throw error on all methods', async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres({});
      await expect(likeRepositoryPostgres.addLike('c', 'u')).rejects.toThrow('Sequelize models not available');
      await expect(likeRepositoryPostgres.deleteLike('c', 'u')).rejects.toThrow('Sequelize models not available');
      await expect(likeRepositoryPostgres.verifyLikeStatus('c', 'u')).rejects.toThrow('Sequelize models not available');
      await expect(likeRepositoryPostgres.getLikeCountByCommentId('c')).rejects.toThrow('Sequelize models not available');
      await expect(likeRepositoryPostgres.getLikeCountsByCommentIds(['c'])).rejects.toThrow('Sequelize models not available');
    });
  });
});
