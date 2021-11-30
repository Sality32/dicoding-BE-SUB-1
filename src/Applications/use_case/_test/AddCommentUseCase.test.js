const CommentRepository = require('../../../Domains/comment/CommentRepository');
const RegisterComment = require('../../../Domains/comment/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comment/entities/RegisteredComment');
const ThreadRepository = require('../../../Domains/thread/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orcherstrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'ini Content',
    };
    const expectedRegisterdComment = new RegisteredComment({
      id: 'comment-123',
      content: useCasePayload.content,
      thread: 'thread-123',
      owner: 'user-123',
    });
    const owner = 'user-123';
    const threadId = 'thread-123';

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepositoruy = new CommentRepository();

    mockThreadRepository.verifyThreadExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepositoruy.addComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve(expectedRegisterdComment));

    const getCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepositoruy,
    });

    const registeredComment = await getCommentUseCase.execute(
      owner,
      threadId,
      useCasePayload
    );

    expect(registeredComment).toStrictEqual(expectedRegisterdComment);
    expect(mockThreadRepository.verifyThreadExist).toBeCalledWith(threadId);
    expect(mockCommentRepositoruy.addComment).toBeCalledWith(
      owner,
      threadId,
      new RegisterComment({
        content: useCasePayload.content,
      })
    );
  });
});
