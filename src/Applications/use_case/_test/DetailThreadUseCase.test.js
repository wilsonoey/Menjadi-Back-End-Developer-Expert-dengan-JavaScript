// ...existing code...
const DetailThreadUseCase = require('../DetailThreadUseCase');

describe('DetailThreadUseCase', () => {
  let detailThreadUseCase;
  let mockThreadRepository;
  let mockCommentRepository;
  let mockReplyRepository;

  beforeEach(() => {
    // Create mock repositories
    mockThreadRepository = {
      getThreadById: jest.fn(),
    };
    mockCommentRepository = {
      getCommentsByThreadId: jest.fn(),
    };
    mockReplyRepository = {
      getRepliesByThreadId: jest.fn(),
    };

    // Create use case instance
    detailThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create DetailThreadUseCase correctly', () => {
      expect(detailThreadUseCase._threadRepository).toEqual(mockThreadRepository);
      expect(detailThreadUseCase._commentRepository).toEqual(mockCommentRepository);
      expect(detailThreadUseCase._replyRepository).toEqual(mockReplyRepository);
    });
  });

  describe('execute', () => {
    it('should orchestrate the get thread detail correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockThread = {
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Test Body',
        date: '2023-01-01T00:00:00.000Z',
        username: 'user1',
      };

      const mockComments = [
        {
          id: 'comment-1',
          content: 'Test Comment',
          date: '2023-01-01T01:00:00.000Z',
          is_delete: false,
          user: { username: 'user2' },
        },
      ];

      const mockReplies = [
        {
          id: 'reply-1',
          content: 'Test Reply',
          date: '2023-01-01T02:00:00.000Z',
          is_delete: false,
          commentId: 'comment-1',
          user: { username: 'user3' },
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue(mockComments);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue(mockReplies);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(threadId);
      expect(mockReplyRepository.getRepliesByThreadId).toHaveBeenCalledWith(threadId);

      expect(result).toEqual({
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Test Body',
        date: '2023-01-01T00:00:00.000Z',
        username: 'user1',
        comments: [
          {
            id: 'comment-1',
            username: 'user2',
            date: '2023-01-01T01:00:00.000Z',
            content: 'Test Comment',
            replies: [
              {
                id: 'reply-1',
                username: 'user3',
                date: '2023-01-01T02:00:00.000Z',
                content: 'Test Reply',
                is_delete: false,
              },
            ],
          },
        ],
      });
    });

    it('should handle deleted comments and replies correctly', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockThread = {
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Test Body',
        date: '2023-01-01T00:00:00.000Z',
        username: 'user1',
      };

      const mockComments = [
        {
          id: 'comment-1',
          content: 'Deleted Comment',
          date: '2023-01-01T01:00:00.000Z',
          is_delete: true,
          user: { username: 'user2' },
        },
      ];

      const mockReplies = [
        {
          id: 'reply-1',
          content: 'Deleted Reply',
          date: '2023-01-01T02:00:00.000Z',
          is_delete: true,
          commentId: 'comment-1',
          user: { username: 'user3' },
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue(mockComments);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue(mockReplies);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(result.comments[0].content).toBe('**komentar telah dihapus**');
      expect(result.comments[0].replies[0].content).toBe('**balasan telah dihapus**');
    });

    it('should handle Sequelize instance for thread', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockSequelizeThread = {
        get: jest.fn().mockReturnValue({
          id: 'thread-123',
          title: 'Test Thread',
          body: 'Test Body',
          date: '2023-01-01T00:00:00.000Z',
          username: 'user1',
        }),
      };

      mockThreadRepository.getThreadById.mockResolvedValue(mockSequelizeThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue([]);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(mockSequelizeThread.get).toHaveBeenCalledWith({ plain: true });
      expect(result.id).toBe('thread-123');
      expect(result.username).toBe('user1');
    });

    it('should handle array response from thread repository', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockThreadArray = [
        {
          id: 'thread-123',
          title: 'Test Thread',
          body: 'Test Body',
          date: '2023-01-01T00:00:00.000Z',
          username: 'user1',
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThreadArray);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue([]);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(result.id).toBe('thread-123');
      expect(result.username).toBe('user1');
    });

    it('should handle object with numeric key response', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockThreadObject = {
        '0': {
          id: 'thread-123',
          title: 'Test Thread',
          body: 'Test Body',
          date: '2023-01-01T00:00:00.000Z',
          username: 'user1',
        },
      };

      mockThreadRepository.getThreadById.mockResolvedValue(mockThreadObject);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue([]);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(result.id).toBe('thread-123');
      expect(result.username).toBe('user1');
    });

    it('should handle thread with nested user object', async () => {
      // Arrange
      const threadId = 'thread-123';
      const mockThread = {
        id: 'thread-123',
        title: 'Test Thread',
        body: 'Test Body',
        date: '2023-01-01T00:00:00.000Z',
        user: { username: 'user1' },
      };

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue([]);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(result.username).toBe('user1');
    });

    // TODO 210925: Add more edge case tests as needed
    it('should handle comment date as Date instance in execute', async () => {
      // Arrange
      const threadId = 'thread-456';
      const mockThread = {
        id: 'thread-456',
        title: 'Thread with Date Comment',
        body: 'Body',
        date: '2023-01-02T00:00:00.000Z',
        username: 'userA',
      };

      const mockComments = [
        {
          id: 'comment-1',
          content: 'Date object comment',
          date: new Date('2023-01-02T01:00:00.000Z'), // Date instance
          is_delete: false,
          user: { username: 'userB' },
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue(mockComments);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert
      expect(result.comments[0].date).toBe('2023-01-02T01:00:00.000Z');
    });

    // TODO 210925: reply without username or user -> username should be null (covers line 112)
    it('should set reply username to null when reply has no user information', async () => {
      // Arrange
      const threadId = 'thread-null-reply-user';
      const mockThread = {
        id: 'thread-999',
        title: 'Thread Null Reply User',
        body: 'Body',
        date: '2023-01-03T00:00:00.000Z',
        username: 'owner',
      };

      const mockComments = [
        {
          id: 'comment-10',
          content: 'Comment for null-reply-user',
          date: '2023-01-03T01:00:00.000Z',
          is_delete: false,
          user: { username: 'commenter' },
        },
      ];

      const mockReplies = [
        {
          id: 'reply-null-1',
          content: 'Reply with no user fields',
          date: '2023-01-03T02:00:00.000Z',
          is_delete: false,
          commentId: 'comment-10',
          // no user, no username field
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue(mockComments);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue(mockReplies);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert: username should be null due to fallback chain in _insertRepliesIntoComments
      expect(result.comments[0].replies[0].username).toBeNull();
    });

    // New test: comment.user is a Sequelize-like object (get returns username) -> username accessed directly is undefined (covers line ~81)
    it('should handle comment.user as Sequelize-like instance (username property not directly accessible)', async () => {
      // Arrange
      const threadId = 'thread-sequelize-comment-user';
      const mockThread = {
        id: 'thread-1000',
        title: 'Thread Sequelize Comment User',
        body: 'Body',
        date: '2023-01-04T00:00:00.000Z',
        username: 'owner2',
      };

      const sequelizeLikeUser = {
        get: jest.fn().mockReturnValue({ username: 'sequelizeUser' }),
      };

      const mockComments = [
        {
          id: 'comment-20',
          content: 'Comment with sequelize-like user',
          date: '2023-01-04T01:00:00.000Z',
          is_delete: false,
          user: sequelizeLikeUser, // .username is not directly present
        },
      ];

      mockThreadRepository.getThreadById.mockResolvedValue(mockThread);
      mockCommentRepository.getCommentsByThreadId.mockResolvedValue(mockComments);
      mockReplyRepository.getRepliesByThreadId.mockResolvedValue([]);

      // Action
      const result = await detailThreadUseCase.execute(threadId);

      // Assert: because code accesses comment.user.username directly, username will be undefined
      expect(result.comments[0].username).toBeUndefined();
    });
  });

  describe('_formatComments', () => {
    it('should format comments correctly', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          content: 'Test Comment',
          date: '2023-01-01T01:00:00.000Z',
          is_delete: false,
          username: 'user1',
        },
        {
          id: 'comment-2',
          content: 'Deleted Comment',
          date: '2023-01-01T02:00:00.000Z',
          is_delete: true,
          username: 'user2',
        },
      ];

      // Action
      const result = detailThreadUseCase._formatComments(comments);

      // Assert
      expect(result).toEqual([
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
        {
          id: 'comment-2',
          date: '2023-01-01T02:00:00.000Z',
          username: 'user2',
          content: '**komentar telah dihapus**',
        },
      ]);
    });
  });

  describe('_formatReplies', () => {
    it('should format replies correctly with plain objects', () => {
      // Arrange
      const replies = [
        {
          id: 'reply-1',
          content: 'Test Reply',
          date: '2023-01-01T01:00:00.000Z',
          isDelete: false,
          commentId: 'comment-1',
          user: { username: 'user1' },
        },
        {
          id: 'reply-2',
          content: 'Deleted Reply',
          date: new Date('2023-01-01T02:00:00.000Z'),
          isDelete: true,
          commentId: 'comment-1',
          user: { username: 'user2' },
        },
      ];

      // Action
      const result = detailThreadUseCase._formatReplies(replies);

      // Assert
      expect(result).toEqual([
        {
          id: 'reply-1',
          content: 'Test Reply',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          comment_id: 'comment-1',
          is_delete: false,
        },
        {
          id: 'reply-2',
          content: '**balasan telah dihapus**',
          date: '2023-01-01T02:00:00.000Z',
          username: 'user2',
          comment_id: 'comment-1',
          is_delete: true,
        },
      ]);
    });

    it('should format replies correctly with Sequelize dataValues', () => {
      // Arrange
      const replies = [
        {
          dataValues: {
            id: 'reply-1',
            content: 'Test Reply',
            date: '2023-01-01T01:00:00.000Z',
            isDelete: false,
            commentId: 'comment-1',
            user: {
              dataValues: { username: 'user1' },
            },
          },
        },
      ];

      // Action
      const result = detailThreadUseCase._formatReplies(replies);

      // Assert
      expect(result[0].username).toBe('user1');
      expect(result[0].content).toBe('Test Reply');
    });
  });

  describe('_insertRepliesIntoComments', () => {
    it('should insert replies into comments correctly', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          username: 'user2',
          date: '2023-01-01T02:00:00.000Z',
          content: 'Test Reply 1',
          comment_id: 'comment-1',
          is_delete: false,
        },
        {
          id: 'reply-2',
          username: 'user3',
          date: '2023-01-01T01:30:00.000Z',
          content: 'Test Reply 2',
          comment_id: 'comment-1',
          is_delete: false,
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert
      expect(result[0].replies).toHaveLength(2);
      expect(result[0].replies[0].date).toBe('2023-01-01T01:30:00.000Z'); // sorted by date
      expect(result[0].replies[1].date).toBe('2023-01-01T02:00:00.000Z');
    });

    it('should handle replies with camelCase commentId', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          username: 'user2',
          date: '2023-01-01T02:00:00.000Z',
          content: 'Test Reply',
          commentId: 'comment-1',
          is_delete: false,
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert
      expect(result[0].replies).toHaveLength(1);
      expect(result[0].replies[0].id).toBe('reply-1');
    });

    it('should handle deleted replies correctly', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          username: 'user2',
          date: '2023-01-01T02:00:00.000Z',
          content: 'Original content',
          comment_id: 'comment-1',
          is_delete: true,
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert
      expect(result[0].replies[0].content).toBe('**balasan telah dihapus**');
      expect(result[0].replies[0].is_delete).toBe(true);
    });

    it('should handle replies with various user structures', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          date: '2023-01-01T02:00:00.000Z',
          content: 'Reply 1',
          comment_id: 'comment-1',
          is_delete: false,
          user: { username: 'user2' },
        },
        {
          id: 'reply-2',
          date: '2023-01-01T03:00:00.000Z',
          content: 'Reply 2',
          comment_id: 'comment-1',
          is_delete: false,
          username: 'user3',
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert
      expect(result[0].replies[0].username).toBe('user2');
      expect(result[0].replies[1].username).toBe('user3');
    });

    it('should return empty replies array when no matching replies', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T01:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          date: '2023-01-01T02:00:00.000Z',
          content: 'Reply for different comment',
          comment_id: 'comment-2',
          is_delete: false,
          username: 'user2',
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert
      expect(result[0].replies).toHaveLength(0);
    });

    // TODO 210925: Add more edge case tests as needed
    it('should handle reply.date as Date instance in _insertRepliesIntoComments', () => {
      // Arrange
      const comments = [
        {
          id: 'comment-1',
          date: '2023-01-01T00:00:00.000Z',
          username: 'user1',
          content: 'Test Comment',
        },
      ];

      const replies = [
        {
          id: 'reply-1',
          username: 'user2',
          date: new Date('2023-01-01T02:30:00.000Z'), // Date instance to hit instanceof Date branch
          content: 'Reply with Date object',
          comment_id: 'comment-1',
          is_delete: false,
        },
        {
          id: 'reply-2',
          username: 'user3',
          date: '2023-01-01T01:30:00.000Z',
          content: 'Earlier reply',
          comment_id: 'comment-1',
          is_delete: false,
        },
      ];

      // Action
      const result = detailThreadUseCase._insertRepliesIntoComments(comments, replies);

      // Assert: date normalized and sorting applied
      expect(result[0].replies).toHaveLength(2);
      expect(result[0].replies[0].date).toBe('2023-01-01T01:30:00.000Z');
      expect(result[0].replies[1].date).toBe('2023-01-01T02:30:00.000Z');
    });
  });
});
// ...existing code...