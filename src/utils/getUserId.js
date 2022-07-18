import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

export default ({ req }, requireAuth = true) => {
  const headers = req.header('authorization');

  if (headers) {
    const token = headers.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId;
  }
  if (requireAuth) {
    throw new GraphQLError('Authentication require!');
  }

  return null;
};
