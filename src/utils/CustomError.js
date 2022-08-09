import { GraphQLError } from 'graphql';

export class CustomError extends GraphQLError {
  constructor(joiError) {
    super(joiError);
    (this.message = joiError.details[0]?.message),
      (this.field = joiError.details[0]?.context.key),
      Error.captureStackTrace(this, this.constructor);
  }
}
