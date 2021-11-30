const RegisterThread = require('../../Domains/thread/entities/RegisterThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }
  async execute(owner, useCasePayload) {
    const registerThread = new RegisterThread(useCasePayload);
    return this._threadRepository.addThread(owner, registerThread);
  }
}

module.exports = AddThreadUseCase;
