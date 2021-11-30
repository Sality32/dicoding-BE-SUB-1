const CommentRepository = require('../../../Domains/comment/CommentRepository');
const DeleteCommentUseCase = require('../DeleteCommentUseCase');

describe('DeleteCommentUseCase', () => {
  it('should orchestrating the dlete comment action correctly', async () => {
    const commentId = 'comment-123';
    const owner = 'user-123';
    const thread = 'thread-123';
    const mockCommentRepository = new CommentRepository();
    mockCommentRepository.verifyCommentExist = jest
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    const getCommentUseCase = new DeleteCommentUseCase({
      commentRepository: mockCommentRepository,
    });

    await getCommentUseCase.execute(commentId, owner, thread);
    expect(mockCommentRepository.verifyCommentExist).toBeCalledWith(commentId);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(
      commentId,
      owner,
      thread
    );
  });
});
