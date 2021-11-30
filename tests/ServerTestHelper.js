/* istanbul ignore file */
const Jwt = require('@hapi/jwt');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken() {
    const userPayload = {
      id: 'user-123',
      password: 'testtt1',
      username: 'test1',
      fullname: 'Testing 1',
    };
    const accessToken = Jwt.token.generate(
      userPayload,
      process.env.ACCESS_TOKEN_KEY
    );

    return accessToken;
  },
};

module.exports = ServerTestHelper;
