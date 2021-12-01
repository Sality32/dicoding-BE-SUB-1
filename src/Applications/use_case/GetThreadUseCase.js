class GetThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }
  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadExist(useCasePayload);

    return this._threadRepository.getDetailThread(useCasePayload);
  }
}
module.exports = GetThreadUseCase;
