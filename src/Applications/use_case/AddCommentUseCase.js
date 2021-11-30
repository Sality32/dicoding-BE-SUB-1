const RegisterComment = require('../../Domains/comment/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }
  async execute(owner, threadId, useCasePayload) {
    const registerComment = new RegisterComment(useCasePayload);
    await this._threadRepository.verifyThreadExist(threadId);
    return this._commentRepository.addComment(owner, threadId, registerComment);
  }
}
module.exports = AddCommentUseCase;
