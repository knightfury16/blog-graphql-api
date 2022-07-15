import prisma from '../prisma';
import Joi from 'joi';
import { GraphQLYogaError } from '@graphql-yoga/node';
import bcrypt from 'bcryptjs';
import getUserId from '../utils/getUserId';
import generateToken from '../utils/generateToken';

const userValidationSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(10).required(),
  password: Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } })
    .required()
});

export default {
  createUser: async (parent, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    const { error, value: data } = userValidationSchema.validate(args.data);

    if (error) throw new GraphQLYogaError(error);

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({ data });
    return {
      user,
      token: generateToken(user.id)
    };
  },

  loginUser: async (_, { data }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new GraphQLYogaError('Unable to authenticate!');

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new GraphQLYogaError('Unable yo authenticate!');

    return {
      user,
      token: generateToken(user.id)
    };
  },

  deleteUser: async (_, args, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);
    return await prisma.user.delete({
      where: {
        id: userId
      },
      ...select
    });
  },
  updateUser: async (parent, args, { prismaSelect, request }, info) => {
    const userId = getUserId(request);
    const select = prismaSelect(info);
    const { data } = args;
    if (typeof data.password === 'string') {
      const passwordSchema = Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));
      const { error, value } = passwordSchema.validate(data.password);
      if (error) throw new GraphQLYogaError(error);
      data.password = await bcrypt.hash(value, 10);
    }
    console.log(data);
    console.log(userId);
    return await prisma.user.update({ where: { id: userId }, data: { ...data }, ...select });
  }
};
