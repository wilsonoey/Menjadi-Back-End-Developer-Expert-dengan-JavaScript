class ReplyRepository {
  /**
   * @param {any} payload
   * @returns {Promise<any>}
   */
  async addReply(payload) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * @param {string} replyId
   * @returns {Promise<any>}
   */
  async verifyAvailableReplyById(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * @param {string} replyId
   * @param {string} owner
   * @returns {Promise<any>}
   */
  async verifyReplyByOwner(replyId, owner) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * @param {string} threadId
   * @returns {Promise<any>}
   */
  async getRepliesByThreadId(threadId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  /**
   * @param {string} replyId
   * @returns {Promise<any>}
   */
  async softDeleteReplyById(replyId) {
    throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ReplyRepository;
