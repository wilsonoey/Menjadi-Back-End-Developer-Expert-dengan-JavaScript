const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'Reply nanoid(30)',
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      commentId: 123,
      content: true,
      owner: 456,
    };

    // Action and Assert
    expect(() => new AddReply(payload)).toThrowError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddReply object correctly', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'Reply nanoid(30)',
      owner: 'user-123',
    };

    // Action
    const { commentId, owner, content } = new AddReply(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
    expect(content).toEqual(payload.content);
  });

  it('should create AddReply object with default owner if not provided', () => {
    // Arrange
    const payload = {
      commentId: 'comment-123',
      content: 'Reply nanoid(30)',
      owner: 'default-owner',
    };

    // Action
    const { commentId, owner, content } = new AddReply(payload);

    // Assert
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual(payload.owner);
    expect(commentId).toEqual(payload.commentId);
    expect(owner).toEqual('default-owner');
    expect(content).toEqual(payload.content);
  });
});
