class DeleteCommentUseCase {
  constructor({ commentRepository }) {
    this._commentRepository = commentRepository;
  }
  async execute(id, owner, thread) {
    await this._commentRepository.verifyCommentExist(id);
    await this._commentRepository.deleteComment(id, owner, thread);
  }
}
module.exports = DeleteCommentUseCase;
