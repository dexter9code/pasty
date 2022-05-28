const express = require("express");
const router = express.Router();

const { Movie, validateMovie } = require("../model/movie");
const { Genre } = require("../model/genre");
const authObjectId = require("../middleware/authObjectId");

router.get("/", async (req, res) => {
  const movie = await Movie.find().sort("title");
  res.send(movie);
});

router.get("/:id", authObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(400).send("NOT-FOUND");
  res.send(movie);
});

router.post("/", async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre");

  try {
    let movie = new Movie({
      title: req.body.title,
      genre: { _id: genre._id, name: genre.name },
      isAvailable: req.body.isAvailable,
      rating: req.body.rating,
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate,
    });
    movie = await movie.save();
    res.send(movie);
  } catch (error) {
    console.log(error.message);
  }
});

router.delete("/:id", authObjectId, async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie) return res.status(400).send("INVALID ID");
  res.send(movie);
});

module.exports = router;
