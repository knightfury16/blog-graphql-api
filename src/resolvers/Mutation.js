// local import
import user from '../entity/user';
import post from '../entity/post';
import comment from '../entity/comment';

export default {
  ...user,
  ...post,
  ...comment
};
