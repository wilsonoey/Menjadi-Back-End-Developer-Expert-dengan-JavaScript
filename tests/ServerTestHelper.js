const ServerTestHelper = {
  async registerUser({ server, username = "Wilson" }) {
    const response = await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username,
        password: "secret",
        fullname: "Wilson Jonathan Oey",
      },
    });

    const {
      data: {
        addedUser: { id },
      },
    } = JSON.parse(response.payload);
    return id;
  },

  async getAccessToken({ server, username = "Wilson", password = "secret" }) {
    const user = { username, password };

    const loginUser = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: user,
    });

    const {
      data: { accessToken },
    } = JSON.parse(loginUser.payload);

    return accessToken;
  },

  async generateAccessToken(server) {
    const userPayload = {
      username: 'user123',
      password: 'strongpassword',
      fullname: 'User Test',
    };

    const responseAddUser = await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    const { addedUser: { id: owner } } = (JSON.parse(responseAddUser.payload)).data;

    const authPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };

    const responseAuth = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: authPayload,
    });

    const { accessToken } = (JSON.parse(responseAuth.payload)).data;

    return { accessToken, owner };
  },
};

module.exports = ServerTestHelper;