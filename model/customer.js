const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const customerSchema = new mongoose.Schema({
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

const Customer = mongoose.model("customer", customerSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    phone: Joi.number().min(10).required(),
    isGold: Joi.boolean(),
  });

  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
