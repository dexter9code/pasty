const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const { genreSchema } = require("./genre");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 30,
    trim: true,
  },
  genre: { type: genreSchema, required: true },
  isAvailable: { type: Boolean, required: true },
  rating: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value && value > 0;
      },
      message: "Rating Should be valid",
    },
  },
  numberInStock: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
    min: 0,
    max: 255,
  },
});

const Movie = mongoose.model("movie", movieSchema);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(30).required(),
    genreId: Joi.string().required(),
    isAvailable: Joi.boolean(),
    rating: Joi.number(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required(),
  });

  return schema.validate(movie);
}

module.exports.Movie = Movie;
module.exports.validateMovie = validateMovie;
