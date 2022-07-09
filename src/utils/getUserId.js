import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';

export default ({ request }) => {
  const headers = request.headers.get('authorization');

  if (!headers) throw new GraphQLError('Authentication require!');

  const token = headers.replace('Bearer ', '');

  const decoded = jwt.verify(token, 'thisismysecret');

  return decoded.userId;
};
