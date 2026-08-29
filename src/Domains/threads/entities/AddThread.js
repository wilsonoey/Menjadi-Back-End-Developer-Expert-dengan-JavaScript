class AddThread {
  constructor(payload) {
    this._verifyPayload(payload);
    const { title, body, owner } = payload;
    this.title = title;
    this.body = body;
    this.owner = owner;
  }

  _verifyPayload({ title, body, owner }) {
    switch (true) {
      case !title || !body || !owner:
        throw new Error('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
      case typeof title !== 'string' || typeof body !== 'string' || typeof owner !== 'string':
        throw new Error('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
      default:
        break;
    }
  }
}

module.exports = AddThread;
