import prisma from '../prisma';
import Joi from 'joi';
import { GraphQLYogaError } from '@graphql-yoga/node';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
      token: jwt.sign({ userId: user.id }, 'thisismysecret')
    };
  },

  loginUser: async (_, { data }) => {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) throw new GraphQLYogaError('Unable to authenticate!');

    const isMatch = await bcrypt.compare(data.password, user.password);

    if (!isMatch) throw new GraphQLYogaError('Unable yo authenticate!');

    return {
      user,
      token: jwt.sign({ userId: user.id }, 'thisismysecret')
    };
  },

  deleteUser: async (_, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    return await prisma.user.delete({
      where: {
        id: args.id
      },
      ...select
    });
  },
  updateUser: async (parent, args, { prismaSelect }, info) => {
    const select = prismaSelect(info);
    const { id, data } = args;
    return await prisma.user.update({ where: { id }, data: { ...data }, ...select });
  }
};
