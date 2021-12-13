class GetThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }
  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);
    const thread = await this._threadRepository.getDetailThread(useCasePayload);
    thread.comments = await this._commentRepository.getCommentByThreadId(
      useCasePayload
    );
    thread.comments = this._checkIsDeletedComments(thread.comments);

    return thread;
  }
  _checkIsDeletedComments(comment) {
    let result = [];
    comment.forEach((object) => {
      const data = {
        id: object.id,
        date: object.date,
        content: object.is_delete
          ? '**komentar telah dihapus**'
          : object.content,
        username: object.username,
      };
      result.push(data);
    });
    return result;
  }
}
module.exports = GetThreadUseCase;
