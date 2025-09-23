class DetailThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  // TODO 110925: Refactor to use ORM and handle various return types
  async execute(threadId) {
    const rawThread = await this._threadRepository.getThreadById(threadId);
    // TODO 120925: Fetch comments and format them
    const rawComments = await this._commentRepository.getCommentsByThreadId(threadId);
    const comments = rawComments.map(comment => ({
      id: comment.id,
      content: comment.content,
      date: new Date(comment.date).toISOString(),
      is_delete: comment.is_delete,
      username: comment.user.username,
    }));
    // TODO 120925: Fetch replies and format them
    const rawReplies = await this._replyRepository.getRepliesByThreadId(threadId);
    const replies = rawReplies.map((reply) => ({
      ...reply,
      content: reply.is_delete ? '**balasan telah dihapus**' : reply.content,
    }));
    const formattedComments = this._formatComments(comments);
    const formattedReplies = this._formatReplies(replies);
    // eslint-disable-next-line max-len
    const commentsWithReplies = this._insertRepliesIntoComments(formattedComments, formattedReplies);

    // Normalize rawThread to a plain object to avoid response like { "0": { ... }, comments: [...] }
    let threadObj = rawThread;

    // If it's a Sequelize instance, convert to plain object
    if (threadObj && typeof threadObj.get === 'function') {
      try {
        threadObj = threadObj.get({ plain: true });
      } catch (e) {
        // fallthrough - if conversion fails, continue with other checks
      }
    }

    // If repository returned an array, take first element
    if (Array.isArray(threadObj) && threadObj.length > 0) {
      threadObj = threadObj[0];
    }

    // If repository returned an object with numeric key '0' (from spreading a result), use it
    if (threadObj && typeof threadObj === 'object' && Object.prototype.hasOwnProperty.call(threadObj, '0')) {
      threadObj = threadObj['0'];
    }

    // Ensure threadObj exists (repository should throw otherwise)
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
      date: comment.date,
      username: comment.username,
      content: comment.is_delete ? '**komentar telah dihapus**' : comment.content,
    }));
  }

  _formatReplies(replies) {
    return replies.map((reply) => {
      // TODO 130925: Handle Sequelize instance - get plain data
      const replyData = reply.dataValues || reply;
      const userData = replyData.user?.dataValues || replyData.user || {};
      return {
        id: replyData.id,
        content: replyData.isDelete ? '**balasan telah dihapus**' : replyData.content,
        date: replyData.date instanceof Date ? replyData.date.toISOString() : (new Date(replyData.date)).toISOString(),
        username: userData.username,
        comment_id: replyData.commentId,
        is_delete: replyData.isDelete,
      };
    });
  }

  _insertRepliesIntoComments(comments, replies) {
    // TODO 130925: Karena menerapkan clean architecture, harus ubah struktur data
    // sehingga komentar memiliki array replies yang berisi balasan terkait
    return comments.map((comment) => {
      const commentWithReplies = { ...comment };

      // pilih replies yang cocok baik dengan key snake_case atau camelCase
      const matchedReplies = replies.filter((reply) => {
        return reply.comment_id === comment.id || reply.commentId === comment.id;
      });

      // normalisasi setiap reply: ubah date ke ISO, tentukan content jika dihapus,
      // ambil username dari berbagai struktur yang mungkin, dan hapus field penghubung
      commentWithReplies.replies = matchedReplies
        .map((reply) => {
          const id = reply.id;
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
        // opsional: urutkan berdasarkan tanggal naik (sesuaikan kebutuhan)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return commentWithReplies;
    });
  }
}

module.exports = DetailThreadUseCase;