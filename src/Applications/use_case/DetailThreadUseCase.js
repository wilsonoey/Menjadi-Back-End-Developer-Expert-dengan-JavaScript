class DetailThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(threadId) {
    const rawThread = await this._threadRepository.getThreadById(threadId);
    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const commentIds = rawComments.map((c) => c.id);

    let likeCounts = {};
    if (this._likeRepository && typeof this._likeRepository.getLikeCountsByCommentIds === 'function') {
      likeCounts = await this._likeRepository.getLikeCountsByCommentIds(commentIds);
    } else if (this._likeRepository && typeof this._likeRepository.getLikeCountByCommentId === 'function') {
      for (const id of commentIds) {
        likeCounts[id] = await this._likeRepository.getLikeCountByCommentId(id);
      }
    }

    const comments = rawComments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      date: new Date(comment.date).toISOString(),
      is_delete: comment.is_delete,
      username: comment.user ? comment.user.username : (comment.username || ''),
      likeCount: (likeCounts && likeCounts[comment.id]) || 0,
    }));

    const rawReplies = await this._replyRepository.getRepliesByThreadId(threadId);
    const replies = rawReplies.map((reply) => ({
      ...reply,
      content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
    }));
    const formattedComments = this._formatComments(comments);
    const formattedReplies = this._formatReplies(replies);
    const commentsWithReplies = this._insertRepliesIntoComments(formattedComments, formattedReplies);

    let threadObj = rawThread;

    if (threadObj && typeof threadObj.get === 'function') {
      try {
        threadObj = threadObj.get({ plain: true });
      } catch (e) {
        // fallthrough
      }
    }

    if (Array.isArray(threadObj) && threadObj.length > 0) {
      [threadObj] = threadObj;
    }

    if (threadObj && typeof threadObj === 'object' && Object.prototype.hasOwnProperty.call(threadObj, '0')) {
      threadObj = threadObj['0'];
    }

    const username = threadObj && (threadObj.username || (threadObj.user && threadObj.user.username));

    const resultThread = {
      id: threadObj.id,
      title: threadObj.title,
      body: threadObj.body,
      date: threadObj.date,
      username,
      comments: commentsWithReplies,
    };

    return resultThread;
  }

  _formatComments(comments) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
      likeCount: typeof comment.likeCount === 'number' ? comment.likeCount : 0,
    }));
  }

  _formatReplies(replies) {
    return replies.map((reply) => {
      const replyData = reply.dataValues || reply;
      const userData = replyData.user?.dataValues || replyData.user || {};
      const isDelete = replyData.is_delete !== undefined ? replyData.is_delete : replyData.isDelete;
      return {
        id: replyData.id,
        content: isDelete ? '**balasan telah dihapus**' : replyData.content,
        date: replyData.date instanceof Date ? replyData.date.toISOString() : (new Date(replyData.date)).toISOString(),
        username: userData.username || replyData.username,
        comment_id: replyData.comment_id || replyData.commentId,
        is_delete: isDelete,
      };
    });
  }

  _insertRepliesIntoComments(comments, replies) {
    return comments.map((comment) => {
      const commentWithReplies = { ...comment };

      const matchedReplies = replies.filter((reply) => reply.comment_id === comment.id || reply.commentId === comment.id);

      commentWithReplies.replies = matchedReplies
        .map((reply) => {
          const { id } = reply;
          const is_delete = reply.is_delete ?? reply.isDelete ?? false;
          const rawDate = reply.date;
          const date = rawDate instanceof Date ? rawDate.toISOString() : (new Date(rawDate)).toISOString();
          const username = reply.username || (reply.user && reply.user.username) || (reply.user?.username) || null;
          const content = is_delete ? '**balasan telah dihapus**' : reply.content;

          return {
            id,
            username,
            date,
            content,
            is_delete,
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return commentWithReplies;
    });
  }
}

module.exports = DetailThreadUseCase;
