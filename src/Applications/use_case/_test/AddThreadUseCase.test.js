const RegisteredThread = require('../../../Domains/thread/entities/RegisteredThread');
const RegisterThread = require('../../../Domains/thread/entities/RegisterThread');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Ini Adalah title',
      body: 'Ini Adalah Body',
    };
    const owner = 'user-123';
    const expectedRegisteredThread = new RegisteredThread({
      id: 'thread-123',
      title: useCasePayload.title,
      body: useCasePayload.body,
      owner: 'user-123',
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedRegisteredThread));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const registeredThread = await getThreadUseCase.execute(
      owner,
      useCasePayload
    );

    expect(registeredThread).toStrictEqual(expectedRegisteredThread);
    expect(mockThreadRepository.addThread).toBeCalledWith(
      owner,
      new RegisterThread({
        title: useCasePayload.title,
        body: useCasePayload.body,
      })
    );
  });
});
