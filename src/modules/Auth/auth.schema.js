import Joi from "joi";
export const signUpSchema = {
  body: Joi.object({
    name: Joi.string().min(3).max(30).required(),

    email: Joi.string().email().required(),
    phone: Joi.array().items(Joi.string()),
    address: Joi.array().items(Joi.string()),
    age: Joi.number().required(),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      }),
  }),
};

export const sigInSchema = {
  body: Joi.object({
    email: Joi.string().email().required(),

    password: Joi.string().required(),
  }),
};

export const confirmMail = {
  params: Joi.object({
    token: Joi.string().required().length(32),
  }),
};
export const rfToken = {
  params: Joi.object({
    rfToken: Joi.string().required().length(32),
  }),
};

export const forgetSchme = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};
export const resetSchema = {
  body: Joi.object({
    otp: Joi.string().required(),

    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$!%*?&])[A-Za-z\d$!%*?&]{8,}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must have at least one lowercase letter, one uppercase letter, one number and one special character",
        "any.required": "You need to provide a password",
        "string.min": "Password should have a minimum length of 3 characters",
      }),
  }),
};
