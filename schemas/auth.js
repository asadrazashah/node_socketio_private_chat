const Joi = require("@hapi/joi");
const signupSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  companyName: Joi.string().required(),
});
const signinSchema = Joi.object().keys({
  email: Joi.string().required(),
  password: Joi.string(),
});
const verificationTokenSchema = Joi.object().keys({
  token: Joi.string().required(),
});

const profileSchema = Joi.object().keys({
  userId: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.string(),
  number: Joi.number().required(),
  gender: Joi.string(),
  image: Joi.any(),
});

module.exports = {
  signupSchema,
  signinSchema,
  verificationTokenSchema,
  profileSchema,
};
