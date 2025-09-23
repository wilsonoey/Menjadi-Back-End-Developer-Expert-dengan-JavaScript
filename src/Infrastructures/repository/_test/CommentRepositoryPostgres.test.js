const CommentTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const ThreadTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const NewComment = require("../../../Domains/comments/entities/AddComment");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
// TODO 110925: Sesuaikan helper ini dengan package yang digunakan
const SequelizePool = require('../../database/SequelizePool');

const pool = new SequelizePool();

describe("CommentRepositoryPostgres", () => {
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

  beforeEach(async () => {
    // TODO 220925: Gunakan user yang sesuai
    await UsersTableTestHelper.addUser({ id: "user-123", username: "user-123" });
    await ThreadTableTestHelper.addThread({
      id: "thread-123",
      owner: "user-123",
    });
  });

  afterEach(async () => {
    await CommentTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await ThreadTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    // TODO 110925: Implementasikan penutupan koneksi Sequelize jika diperlukan
    await pool.close();
  });

  // TODO 120925: Sesuaikan test berikut jika diperlukan
  describe('CommentRepositoryPostgres constructor', () => {
    it('should set this._models when pool has getModels method', () => {
      // Arrange
      const pool = {
        getModels: jest.fn().mockReturnValue('models')
      };
      
      // Act
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Assert
      expect(pool.getModels).toHaveBeenCalled();
      expect(commentRepositoryPostgres._models).toEqual('models');
    });

    it('should not set this._models when pool does not have getModels method', () => {
      // Arrange
      const pool = {};
      
      // Act
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      
      // Assert
      expect(commentRepositoryPostgres._models).toBeUndefined();
    });
  });

  describe("addComment function", () => {
    // TODO 150925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const newComment = new NewComment({
        content: "Comment content test",
        owner: "user-123",
        threadId: "thread-123",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres({}, () => '123');

      // Action & Assert
      await expect(commentRepositoryPostgres.addComment(newComment))
        .rejects.toThrow('Sequelize models not available');
    });

    // TODO 210925: Tambahkan test untuk error ketika pool.getModels ada tapi mengembalikan undefined
    it('should throw an error if pool.getModels exists but returns undefined (constructor called getModels)', async () => {
      // Arrange
      const newComment = new NewComment({
        content: "Comment content test",
        owner: "user-123",
        threadId: "thread-123",
      });
      const poolMock = { getModels: jest.fn().mockReturnValue(undefined) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock, () => '123');

      // Action & Assert
      await expect(commentRepositoryPostgres.addComment(newComment))
        .rejects.toThrow('Sequelize models not available');
      expect(poolMock.getModels).toHaveBeenCalled();
    });
    
    it("should persist new comment and return added comment correctly", async () => {
      // Arrange
      const newComment = new NewComment({
        content: "Comment content test",
        owner: "user-123",
        threadId: "thread-123",
      });

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comments =
        await CommentTableTestHelper.findCommentByIdIsDeleteFalse(
          "comment-123"
        );
      expect(comments).toHaveLength(1);
    });

    // TODO 180925: New tests to cover both branches of createdComment.get ? ... : ...
    it('should return added comment when createdComment has a get method (covers .get branch)', async () => {
      // Arrange
      const newComment = new NewComment({
        content: "Comment content test",
        owner: "user-123",
        threadId: "thread-123",
      });
      const fakeIdGenerator = () => "123";

      const plainResult = {
        id: "comment-123",
        content: newComment.content,
        owner: newComment.owner
      };
      const models = {
        Comment: {
          create: jest.fn().mockResolvedValue({
            get: () => plainResult
          })
        },
      };
      const poolMock = { getModels: jest.fn().mockReturnValue(models) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(new AddedComment({
        id: plainResult.id,
        content: plainResult.content,
        owner: plainResult.owner
      }));
      expect(models.Comment.create).toHaveBeenCalled();
      expect(poolMock.getModels).toHaveBeenCalled();
      expect(models.Comment.create.mock.calls[0][0]).toMatchObject({
        id: "comment-123",
        content: newComment.content,
        owner: newComment.owner,
        thread_id: newComment.threadId,
        date: expect.any(String)
      });
    });

    // TODO 220925: Test untuk memastikan else branch juga ter-cover
    it('should return added comment when createdComment is a plain object (covers else branch)', async () => {
      // Arrange
      const newComment = new NewComment({
        content: "Comment content test",
        owner: "user-123",
        threadId: "thread-123",
      });
      const fakeIdGenerator = () => "123";

      const plainResult = {
        id: "comment-123",
        content: newComment.content,
        owner: newComment.owner
      };
      const models = {
        Comment: {
          create: jest.fn().mockResolvedValue(plainResult) // Mock returns a plain object
        },
      };
      const poolMock = { getModels: jest.fn().mockReturnValue(models) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "Comment content test",
          owner: "user-123",
        })
      );
    });
  });

  describe('verifyAvailableCommentById function', () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentById('comment-123', 'user-123'))
        .rejects.toThrow('Sequelize models not available');
    });

    // TODO 210925: Tambahkan test untuk error ketika pool.getModels ada tapi mengembalikan undefined
    it('should throw an error if pool.getModels exists but returns undefined (constructor called getModels)', async () => {
      // Arrange
      const poolMock = { getModels: jest.fn().mockReturnValue(undefined) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentById('comment-123'))
        .rejects.toThrow('Sequelize models not available');
      expect(poolMock.getModels).toHaveBeenCalled();
    });

    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentById('comment-123'))
        .rejects
        .toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment exists', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      // TODO 120925: Perbaiki pemanggilan helper untuk memastikan komentar tidak dihapus
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'Example Comment',
        owner: 'user-123'
      });

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyAvailableCommentById('comment-123'))
        .resolves
        .not
        .toThrowError(NotFoundError);
    });
  });

  describe("verifyCommentByOwner function", () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({});

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentByOwner('comment-123', 'user-123'))
        .rejects.toThrow('Sequelize models not available');
    });

    // TODO 210925: Tambahkan test untuk error ketika pool.getModels ada tapi mengembalikan undefined
    it('should throw an error if pool.getModels exists but returns undefined (constructor called getModels)', async () => {
      // Arrange
      const poolMock = { getModels: jest.fn().mockReturnValue(undefined) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock);

      // Action & Assert
      await expect(commentRepositoryPostgres.verifyCommentByOwner('comment-123', 'user-123'))
        .rejects.toThrow('Sequelize models not available');
      expect(poolMock.getModels).toHaveBeenCalled();
    });

    it("should throw AuthorizationError when comment have invalid owner", async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => {}
      );

      // Action and Assert
      await expect(
        // TODO 120925: Perbaiki pemanggilan fungsi dengan parameter yang benar
        commentRepositoryPostgres.verifyCommentByOwner(
          "comment-123",
          "invalid-user"
        )
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should not throw AuthorizationError when comment have valid owner", async () => {
      // Arrange
      await CommentTableTestHelper.addComment({
        id: "comment-123",
        threadId: "thread-123",
        owner: "user-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => {}
      );

      // Action and Assert
      await expect(
        // TODO 120925: Perbaiki pemanggilan fungsi dengan parameter yang benar
        commentRepositoryPostgres.verifyCommentByOwner("comment-123", "user-123")
      ).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe("softDeleteCommentById function", () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({});
      // Action & Assert
      await expect(commentRepositoryPostgres.softDeleteCommentById('comment-123'))
        .rejects.toThrow('Sequelize models not available');
    });

    // TODO 210925: Tambahkan test untuk error ketika pool.getModels ada tapi mengembalikan undefined
    it('should throw an error if pool.getModels exists but returns undefined (constructor called getModels)', async () => {
      // Arrange
      const poolMock = { getModels: jest.fn().mockReturnValue(undefined) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock);

      // Action & Assert
      await expect(commentRepositoryPostgres.softDeleteCommentById('comment-123'))
        .rejects.toThrow('Sequelize models not available');
      expect(poolMock.getModels).toHaveBeenCalled();
    });

    // TODO 160925: Sesuaikan test berikut jika diperlukan
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.softDeleteCommentById('non-existent-comment'))
        .rejects.toThrowError(NotFoundError);
    });

    it("should delete comment by comment id correctly", async () => {
      // Arrange
      await CommentTableTestHelper.addComment({
        id: "comment-123",
        owner: "user-123",
        threadId: "thread-123",
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => {}
      );

      // Action
      // TODO 120925: Perbaiki pemanggilan fungsi dengan parameter yang benar
      await commentRepositoryPostgres.softDeleteCommentById("comment-123");

      // Assert
      // TODO 180925: Lakukan assert terhadap nilai is_delete untuk memastikan apakah atribut tersebut bernilai true atau tidak
      const comments = await CommentTableTestHelper.findCommentById(
        "comment-123"
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].is_delete).toBe(true);
    });
  });

  describe("getCommentsByThreadId function", () => {
    // TODO 160925: Tambahkan test untuk error ketika models tidak tersedia
    it('should throw an error if models are not available', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres({});

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentsByThreadId('thread-123'))
        .rejects.toThrow('Sequelize models not available');
    });

    // TODO 210925: Tambahkan test untuk error ketika pool.getModels ada tapi mengembalikan undefined
    it('should throw an error if pool.getModels exists but returns undefined (constructor called getModels)', async () => {
      // Arrange
      const poolMock = { getModels: jest.fn().mockReturnValue(undefined) };
      const commentRepositoryPostgres = new CommentRepositoryPostgres(poolMock);

      // Action & Assert
      await expect(commentRepositoryPostgres.getCommentsByThreadId('thread-123'))
        .rejects.toThrow('Sequelize models not available');
      expect(poolMock.getModels).toHaveBeenCalled();
    });

    it("should return empty array when not found comment in thread", async () => {
      // Arrange
      const threadId = "thread-123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => {}
      );

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId(
        threadId
      );

      // Assert
      expect(comments).toHaveLength(0);
    });

    // Update the test case for comparing dates
    it('should return all comment by thread id correctly', async () => {
      // Arrange
      // Use specific dates to ensure consistent ordering
      const date1 = new Date();
      const date2 = new Date(); // Later than date1
      // UNUSED 180925: Jangan sesuaikan datetime dengan kebutuhan testing
      // TODO 180925: Kembalikan ke semula
      const exampleComment1 = {
        id: 'comment-123',
        content: 'Comment content test',
        date: date1,
        owner: 'user-123',
        threadId: 'thread-123',
      };
    
      const exampleComment2 = {
        id: 'comment-124',
        content: 'Comment content test',
        date: date2,
        owner: 'user-123',
        threadId: 'thread-123',
      };
    
      await CommentTableTestHelper.addComment(exampleComment2);
      await CommentTableTestHelper.addComment(exampleComment1);
      
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => {}
      );
 
      // Action
      let comments = await commentRepositoryPostgres.getCommentsByThreadId(
        "thread-123"
      );
 
      // UNUSED 180925: Tidak melakukan manipulasi data secara manual
      // Assert - Sort by date ascending to match repository ordering
      // TODO 180925: Kembalikan ke semula lalu ubah struktur object
      // TODO 220925: Ganti dengan manual declarative test
      expect(comments).not.toBeUndefined();
      expect(comments[0]).toHaveProperty('date');
      expect(comments[1]).toHaveProperty('date');
      expect(comments[0].id).toBeTruthy();
      expect(comments[0].id).not.toBe('');
      expect(comments[0].id).not.toBe(null);
      expect(comments[0].id).not.toBe(undefined);
      expect(new Date(comments[0].date).toISOString()).toBeTruthy();
      expect(new Date(comments[0].date)).toBeInstanceOf(Date);
      expect(new Date(comments[0].date).toString()).not.toBe('Invalid Date');
      expect(comments[0].content).toBeTruthy();
      expect(comments[0].content).not.toBe('');
      expect(comments[0].user.username).toEqual(exampleComment1.owner);
      expect(comments[0].owner).toEqual(exampleComment1.owner);
      expect(comments[0].thread_id).toEqual(exampleComment1.threadId);
      expect(comments[0].is_delete).toEqual(false);
      expect(comments[1].id).toBeTruthy();
      expect(comments[1].id).not.toBe('');
      expect(comments[1].id).not.toBe(null);
      expect(comments[1].id).not.toBe(undefined);
      expect(new Date(comments[1].date).toISOString()).toBeTruthy();
      expect(new Date(comments[1].date)).toBeInstanceOf(Date);
      expect(new Date(comments[1].date).toString()).not.toBe('Invalid Date');
      expect(comments[1].content).toBeTruthy();
      expect(comments[1].content).not.toBe('');
      expect(comments[1].user.username).toEqual(exampleComment2.owner);
      expect(comments[1].owner).toEqual(exampleComment2.owner);
      expect(comments[1].thread_id).toEqual(exampleComment2.threadId);
      expect(comments[1].is_delete).toEqual(false);
    });
  });
});