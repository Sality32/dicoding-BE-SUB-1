const ClientError = require('../ClientError');
const ForbiddenError = require('../ForbiddenError');

describe('ForbiddenError', () => {
  it('shouold create an error correctly', () => {
    const forbiddenError = new ForbiddenError('an error occurs');

    expect(forbiddenError).toBeInstanceOf(ForbiddenError);
    expect(forbiddenError).toBeInstanceOf(ClientError);
    expect(forbiddenError).toBeInstanceOf(Error);

    expect(forbiddenError.statusCode).toEqual(403);
    expect(forbiddenError.message).toEqual('an error occurs');
    expect(forbiddenError.name).toEqual('ForbiddenError');
  });
});
