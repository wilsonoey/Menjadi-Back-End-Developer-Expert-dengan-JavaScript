const Jwt = require('jsonwebtoken');
const CommentTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const ThreadTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const JwtTokenManager = require('../../security/JwtTokenManager');
const SequelizePool = require('../../database/SequelizePool');

const pool = new SequelizePool();
const jwtTokenManager = new JwtTokenManager(Jwt);

jest.setTimeout(60000);

describe('/threads/{threadId}/comments/{commentId}/replies', () => {
  const cleanAllTables = async () => {
    await pool.getSequelize().query('DELETE FROM comment_replies; DELETE FROM user_comment_likes; DELETE FROM comments; DELETE FROM threads; DELETE FROM authentications; DELETE FROM users;');
  };

  beforeAll(async () => {
    await pool.getSequelize().authenticate();
    await cleanAllTables();
  });

  afterAll(async () => {
    await cleanAllTables();
    await pool.close();
  });

  afterEach(async () => {
    await cleanAllTables();
  });

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 401 when request missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 404 when request id thread or id comment not found in database', async () => {
      // Arrange
      const requestPayload = {
        content: 'content reply comment',
      };
      const server = await createServer(container);
      const userId = 'user-test-2';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_2' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_2', id: userId });

      await ThreadTableTestHelper.addThread({
        id: 'thread-test-2',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-test-2/comments/xxx/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('comment tidak ditemukan di database');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container);
      const userId = 'user-test-3';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_3' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_3', id: userId });

      await ThreadTableTestHelper.addThread({
        id: 'thread-test-3',
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-test-3',
        threadId: 'thread-test-3',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-test-3/comments/comment-test-3/replies',
        payload: {},
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'tidak dapat menambahkan reply comment, request payload tidak lengkap',
      );
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      const requestPayload = {
        content: true,
      };
      const server = await createServer(container);
      const userId = 'user-test-4';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_4' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_4', id: userId });

      await ThreadTableTestHelper.addThread({
        id: 'thread-test-4',
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-test-4',
        threadId: 'thread-test-4',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-test-4/comments/comment-test-4/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION',
      );
    });

    it('should response 201 and persisted reply', async () => {
      // Arrange
      const requestPayload = {
        content: 'content reply comment',
      };
      const server = await createServer(container);
      const userId = 'user-test-5';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_5' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_5', id: userId });

      await ThreadTableTestHelper.addThread({
        id: 'thread-test-5',
        owner: userId,
      });

      await CommentTableTestHelper.addComment({
        id: 'comment-test-5',
        threadId: 'thread-test-5',
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-test-5/comments/comment-test-5/replies',
        payload: requestPayload,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 401 when missing authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123/replies/reply-123',
        payload: {},
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 403 when delete reply is invalid owner', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-test-7',
        commentId: 'comment-test-7',
        replyId: 'reply-test-7',
      };
      const server = await createServer(container);
      const userIdValidOwner = 'user-valid-7';
      const userIdInvalidOwner = 'user-invalid-7';
      await UsersTableTestHelper.addUser({ id: userIdValidOwner, username: 'user_valid_7' });
      await UsersTableTestHelper.addUser({ id: userIdInvalidOwner, username: 'user_invalid_7' });
      const accessTokenInvalidOwner = await jwtTokenManager.createAccessToken({ username: 'user_invalid_7', id: userIdInvalidOwner });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userIdValidOwner,
      });
      await CommentTableTestHelper.addComment({
        id: payload.commentId,
        threadId: payload.threadId,
        owner: userIdValidOwner,
      });
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        threadId: payload.threadId,
        commentId: payload.commentId,
        owner: userIdValidOwner,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessTokenInvalidOwner}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(
        'Anda tidak berhak mengakses resource ini',
      );
    });

    it('should response 404 when delete thread, comment, or reply not found in database', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-test-8',
        commentId: 'comment-test-8',
        replyId: 'reply-test-8',
      };

      const server = await createServer(container);
      const userId = 'user-test-8';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_8' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_8', id: userId });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userId,
      });
      await CommentTableTestHelper.addComment({
        id: payload.commentId,
        threadId: payload.threadId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('reply tidak ditemukan di database');
    });

    it('should response 200 when delete reply correctly', async () => {
      // Arrange
      const payload = {
        threadId: 'thread-test-9',
        commentId: 'comment-test-9',
        replyId: 'reply-test-9',
      };

      const server = await createServer(container);
      const userId = 'user-test-9';
      await UsersTableTestHelper.addUser({ id: userId, username: 'user_test_9' });
      const accessToken = await jwtTokenManager.createAccessToken({ username: 'user_test_9', id: userId });

      await ThreadTableTestHelper.addThread({
        id: payload.threadId,
        owner: userId,
      });
      await CommentTableTestHelper.addComment({
        id: payload.commentId,
        threadId: payload.threadId,
        owner: userId,
      });
      await RepliesTableTestHelper.addReply({
        id: payload.replyId,
        threadId: payload.threadId,
        commentId: payload.commentId,
        owner: userId,
      });

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${payload.threadId}/comments/${payload.commentId}/replies/${payload.replyId}`,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
    });
  });
});
