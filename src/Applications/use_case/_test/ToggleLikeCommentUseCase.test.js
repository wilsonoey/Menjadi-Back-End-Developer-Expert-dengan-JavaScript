const ToggleLikeCommentUseCase = require('../ToggleLikeCommentUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const LikeRepository = require('../../../Domains/likes/LikeRepository');

describe('ToggleLikeCommentUseCase', () => {
  it('should throw error if use case payload not contain needed property', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
    };
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({});

    // Action & Assert
    await expect(toggleLikeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not meet data type specification', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 123,
      commentId: true,
      owner: {},
    };
    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({});

    // Action & Assert
    await expect(toggleLikeCommentUseCase.execute(useCasePayload))
      .rejects
      .toThrow('TOGGLE_LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the add like action correctly when comment is not liked yet', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(false));
    mockLikeRepository.addLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyAvailableCommentById).toHaveBeenCalledWith('comment-123');
    expect(mockLikeRepository.verifyLikeStatus).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.addLike).toHaveBeenCalledWith('comment-123', 'user-123');
  });

  it('should orchestrating the delete like action correctly when comment is already liked', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockLikeRepository = new LikeRepository();

    mockThreadRepository.verifyAvailableThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyAvailableCommentById = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockLikeRepository.verifyLikeStatus = jest.fn()
      .mockImplementation(() => Promise.resolve(true));
    mockLikeRepository.deleteLike = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const toggleLikeCommentUseCase = new ToggleLikeCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      likeRepository: mockLikeRepository,
    });

    // Action
    await toggleLikeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThreadById).toHaveBeenCalledWith('thread-123');
    expect(mockCommentRepository.verifyAvailableCommentById).toHaveBeenCalledWith('comment-123');
    expect(mockLikeRepository.verifyLikeStatus).toHaveBeenCalledWith('comment-123', 'user-123');
    expect(mockLikeRepository.deleteLike).toHaveBeenCalledWith('comment-123', 'user-123');
  });
});
