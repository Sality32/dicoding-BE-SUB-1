const CommentRepository = require('../../../Domains/comment/CommentRepository');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUSeCase', () => {
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
      comments: [],
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
    const { is_delete: is_deletedComment1, ...expectedComment1 } = comment[0];
    const { is_delete: is_deletedComment2, ...expectedComment2 } = comment[1];
    const expectedComments = [expectedComment1, expectedComment2];
    const expectedThread = { thread: thread };
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.getDetailThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedThread));
    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve(useCasePayload.thread));
    mockCommentRepository.getCommentByThreadId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedComments));
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });
    const useCaseResult = await getThreadUseCase.execute(useCasePayload);

    expect(useCaseResult).toEqual({
      ...expectedThread,
      comments: expectedComments,
    });

    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(
      useCasePayload
    );
    expect(mockThreadRepository.getDetailThread).toBeCalledWith(useCasePayload);
  });
  it('should orchestrating the get comment deleted action correctly', () => {
    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: {},
      commentRepository: {},
    });
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
    const { is_delete: is_deletedComment1, ...expectedComment1 } = comment[0];
    const { is_delete: is_deletedComment2, ...expectedComment2 } = comment[1];
    const spyChekIsDeletedComments = jest.spyOn(
      getThreadUseCase,
      '_checkIsDeletedComments'
    );
    getThreadUseCase._checkIsDeletedComments(comment);

    expect(spyChekIsDeletedComments).toReturnWith([
      expectedComment1,
      {
        ...expectedComment2,
        content: '**komentar telah dihapus**',
      },
    ]);
    spyChekIsDeletedComments.mockClear();
  });
});
