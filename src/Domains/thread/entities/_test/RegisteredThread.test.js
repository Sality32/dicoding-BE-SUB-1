const RegisteredThread = require('../RegisteredThread');

describe('a RegisteredThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      username: 'abc',
      title: 'cde',
    };
    expect(() => new RegisteredThread(payload)).toThrowError(
      'REGISTERED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
    );
  });
  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 500,
      body: {},
      id: true,
      owner: true,
    };
    expect(() => new RegisteredThread(payload)).toThrowError(
      'REGISTERED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
    );
  });

  it('should create Registered Thread object correctly', () => {
    const payload = {
      title: 'abc',
      body: 'abc',
      id: 'abc',
      owner: 'abc',
    };

    const { id, title, body, owner } = new RegisteredThread(payload);

    expect(owner).toEqual(payload.owner);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(id).toEqual(payload.id);
  });
});
