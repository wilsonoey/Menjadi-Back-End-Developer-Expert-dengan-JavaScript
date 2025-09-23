const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment nanoid(25)',
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 456,
      owner: true,
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create AddedComment object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment nanoid(25)',
      owner: 'user-123',
    };

    // Action
    const { id, owner, content } = new AddedComment(payload);

    // Assert
    expect(id).toEqual(payload.id);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });

  it('should not throw error when payload contains additional property', () => {
    // Arrange
    const payload = {
      id: 'comment-123',
      content: 'Comment nanoid(25)',
      owner: 'user-123',
      timestamp: Date.now(),
    };

    // Action and Assert
    expect(() => new AddedComment(payload)).not.toThrow();
  });
});
