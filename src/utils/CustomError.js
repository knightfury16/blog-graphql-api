import { GraphQLError } from 'graphql';

export class CustomError extends GraphQLError {
  constructor(error, isJoiError = false) {
    super(error);
    isJoiError ? this.handleJoiError(error) : this.handleNormalError(error);
    Error.captureStackTrace(this, this.constructor);
  }
  handleJoiError(joiError) {
    this.message = joiError.details[0]?.message;
    this.field = joiError.details[0]?.context.key;
  }

  handleNormalError(error) {
    this.message = error.message;
    this.field = error.field;
  }
}
