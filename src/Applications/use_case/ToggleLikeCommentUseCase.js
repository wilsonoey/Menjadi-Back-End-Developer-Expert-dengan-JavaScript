class ToggleLikeCommentUseCase {
  constructor({ threadRepository, commentRepository, likeRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    const { threadId, commentId, owner } = useCasePayload;

    await this._threadRepository.verifyAvailableThreadById(threadId);
    await this._commentRepository.verifyAvailableCommentById(commentId);

    const isLiked = await this._likeRepository.verifyLikeStatus(commentId, owner);

    if (isLiked) {
      await this._likeRepository.deleteLike(commentId, owner);
    } else {
      await this._likeRepository.addLike(commentId, owner);
    }
  }

  _validatePayload(payload) {
    const { threadId, commentId, owner } = payload;
    if (!threadId || !commentId || !owner) {
      throw new Error('TOGGLE_LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof owner !== 'string') {
      throw new Error('TOGGLE_LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ToggleLikeCommentUseCase;
