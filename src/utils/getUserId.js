import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

export default ({ request }, requireAuth = true) => {
  const headers = request.headers.get('authorization');

  if (headers) {
    const token = headers.replace('Bearer ', '');
    const decoded = jwt.verify(token, 'thisismysecret');
    return decoded.userId;
  }
  if (requireAuth) {
    throw new GraphQLError('Authentication require!');
  }

  return null;
};
