const { Joi, celebrate } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }

  return helpers.error("string.uri");
};

const validateUserBody = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    avatar: Joi.string().custom(validateURL),
  }),
});

const validateAuthentication = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
});

const validateTableStatusUpdate = celebrate({
  params: Joi.object().keys({
    tableId: Joi.string().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string().valid("open", "occupied", "reserved", "dirty").required(),
  }),
});

module.exports = {
  validateUserBody,
  validateAuthentication,
  validateTableStatusUpdate,
};
