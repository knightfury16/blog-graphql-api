import prisma from '../prisma';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';
import { userValidationSchema } from '../utils/userValidationSchema';
import { GraphQLError } from 'graphql';
import { CustomError } from '../utils/CustomError';

export default {
  createUser: async (_, args, { prismaSelect }, info) => {
    // removing token from info and merging password field
    const select = prismaSelect(info, true).valueOf('user', 'User', { select: { password: true } });

    const { error, value: data } = userValidationSchema.validate(args.data);

    if (error) throw new CustomError(error, true);

    data.password = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({ data, ...select });
      return {
        user,
        token: generateToken(user.id)
      };
    } catch (error) {
      // email not unique
      if (error.code === 'P2002') {
        throw new CustomError({ message: 'email taken', field: 'email' });
      }
      throw new Error(error);
    }
  },

  loginUser: async (_, { data }, { prismaSelect }, info) => {
    // removing token from info and merging password field
    const select = prismaSelect(info, true).valueOf('user', 'User', { select: { password: true } });

    const user = await prisma.user.findUnique({ where: { email: data.email }, ...select });

    if (!user) throw new CustomError({ message: 'email does not exist', field: 'email' });

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new CustomError({ message: 'incorrect password', field: 'password' });

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
