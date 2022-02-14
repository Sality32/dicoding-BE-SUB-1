const CommentRepository = require('../../../Domains/comment/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    const useCasePayload = {
      thread: 'thread-123',
    };

    const thread = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: '2021-10-10',
      username: 'dicoding',
    };
    const comment = [
      {
        id: 'comment-123',
        username: 'test1',
        date: '2021-11-11',
        content: 'content',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'test2',
        date: '2021-11-31',
        content: 'content',
        is_delete: true,
      },
    ];
    const expectedResult = {
      id: 'thread-123',
      title: 'title',
      body: 'body',
      date: '2021-10-10',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          date: '2021-11-11',
          content: 'content',
          username: 'test1',
        },
        {
          id: 'comment-124',
          date: '2021-11-31',
          content: '**komentar telah dihapus**',
          username: 'test2',
        },
      ],
    };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(useCasePayload.thread));
    mockThreadRepository.getDetailThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(thread));

    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(comment));
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const useCaseResult = await getThreadUseCase.execute(useCasePayload);

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload);
    expect(useCaseResult).toEqual(expectedResult);
  });
});
