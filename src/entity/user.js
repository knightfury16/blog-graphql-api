import prisma from '../prisma';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import { userValidationSchema } from '../utils/userValidationSchema';

export default {
  createUser: async (_, args) => {
    const { error, value: data } = userValidationSchema.validate(args.data);

    if (error) throw new Error(error);

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({ data });
    return {
      user,
      token: generateToken(user.id)
    };
  },

  loginUser: async (_, { data }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new Error('Unable to authenticate!');

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new Error('Unable to authenticate!');

    return {
      user,
      token: generateToken(user.id)
    };
  },

  deleteUser: async (_, __, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);

    return await prisma.user.delete({
      where: {
        id: userId
      },
      ...select
    });
  },

  updateUser: async (_, args, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);
    const { data } = args;
    if (typeof data.password === 'string') {
      const passwordSchema = Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));
      const { error, value } = passwordSchema.validate(data.password);
      if (error) throw new Error(error);
      data.password = await bcrypt.hash(value, 10);
    }
    return await prisma.user.update({ where: { id: userId }, data: { ...data }, ...select });
  }
};
