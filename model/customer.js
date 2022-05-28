const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 30,
    minlength: 3,
    trim: true,
  },
  phone: {
    type: Number,
    required: true,
    min: 10,
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});

const User = mongoose.model("user", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    phone: Joi.number().min(10).required(),
    isGold: Joi.boolean(),
  });

  return schema.validate(user);
}

module.exports.User = User;
module.exports.validateUser = validateUser;
