const RegisterComment = require('../../Domains/comment/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }
  async execute(owner, threadId, useCasePayload) {
    await this._threadRepository.verifyThreadExist(threadId);

    const registerComment = new RegisterComment(useCasePayload);
    console.log(threadId + ' ' + owner + ' ' + registerComment.content);
    return this._commentRepository.addComment();
  }
}
module.exports = AddCommentUseCase;
