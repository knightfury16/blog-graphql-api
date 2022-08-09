import Joi from 'joi';

export const userValidationSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(10).required(),
  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net'] } })
    .required(),
  password: Joi.string().min(3).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required()
});
