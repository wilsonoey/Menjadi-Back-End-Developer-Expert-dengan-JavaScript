const ServerTestHelper = {
  async registerUser({ server, username = 'Wilson' }) {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username,
        password: 'secret',
        fullname: 'Wilson Jonathan Oey',
      },
    });

    const {
      data: {
        addedUser: { id },
      },
    } = JSON.parse(response.payload);
    return id;
  },

  async getAccessToken({ server, username = 'Wilson', password = 'secret' }) {
    const user = { username, password };

    const loginUser = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: user,
    });

    const {
      data: { accessToken },
    } = JSON.parse(loginUser.payload);

    return accessToken;
  },

  async generateAccessToken(server) {
    const uniqueId = `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const userPayload = {
      username: uniqueId,
      password: 'strongpassword',
      fullname: 'User Test',
    };

    const responseAddUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    const parsedAddUser = JSON.parse(responseAddUser.payload);
    let owner = parsedAddUser.data ? parsedAddUser.data.addedUser.id : null;
    if (!owner) {
      const UsersTableTestHelper = require('./UsersTableTestHelper');
      await UsersTableTestHelper.addUser({ id: uniqueId, username: uniqueId });
      owner = uniqueId;
    }

    const authPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: authPayload,
    });

    const parsedAuth = JSON.parse(responseAuth.payload);
    let accessToken = parsedAuth.data ? parsedAuth.data.accessToken : null;
    if (!accessToken) {
      const JwtTokenManager = require('../src/Infrastructures/security/JwtTokenManager');
      const Jwt = require('jsonwebtoken');
      const jwtTokenManager = new JwtTokenManager(Jwt);
      accessToken = await jwtTokenManager.createAccessToken({ username: userPayload.username, id: owner });
    }

    return { accessToken, owner };
  },
};

module.exports = ServerTestHelper;
