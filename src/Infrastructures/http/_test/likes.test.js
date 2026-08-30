const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/{commentId}/likes endpoint', () => {
  jest.setTimeout(30000);

  beforeEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterEach(async () => {
    await LikesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when thread or comment not found in database', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken } = await ServerTestHelper.generateAccessToken(server);

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-not-found/comments/comment-not-found/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
    });

    it('should response 200 and toggle like (like and unlike) comment correctly', async () => {
      // Arrange
      const server = await createServer(container);
      const { accessToken, owner } = await ServerTestHelper.generateAccessToken(server);
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner });
      await CommentsTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner });

      // Action 1: Like the comment
      const responseLike = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert 1
      const responseLikeJson = JSON.parse(responseLike.payload);
      expect(responseLike.statusCode).toEqual(200);
      expect(responseLikeJson.status).toEqual('success');

      const likeRecord = await LikesTableTestHelper.findLike({ commentId: 'comment-123', owner });
      expect(likeRecord).toBeDefined();

      // Check detail thread likeCount
      const responseDetail = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });
      const responseDetailJson = JSON.parse(responseDetail.payload);
      expect(responseDetail.statusCode).toEqual(200);
      expect(responseDetailJson.data.thread.comments[0].likeCount).toEqual(1);

      // Action 2: Unlike the comment
      const responseUnlike = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert 2
      const responseUnlikeJson = JSON.parse(responseUnlike.payload);
      expect(responseUnlike.statusCode).toEqual(200);
      expect(responseUnlikeJson.status).toEqual('success');

      const unlikeRecord = await LikesTableTestHelper.findLike({ commentId: 'comment-123', owner });
      expect(unlikeRecord).toBeNull();

      // Check detail thread likeCount after unlike
      const responseDetailAfter = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
      });
      const responseDetailAfterJson = JSON.parse(responseDetailAfter.payload);
      expect(responseDetailAfter.statusCode).toEqual(200);
      expect(responseDetailAfterJson.data.thread.comments[0].likeCount).toEqual(0);
    });
  });
});
