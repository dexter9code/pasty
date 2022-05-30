const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();

const authObjectId = require("../middleware/authObjectId");
const isAdmin = require("../middleware/isAdmin");
const { Genre, validateGenre } = require("../model/genre");

router.get("/", async (req, res) => {
  const genre = await Genre.find().sort("name");
  res.send(genre);
});

router.get("/:id", authObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(400).send("Invalid Id");
  res.send(genre);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();
  res.send(genre);
});

router.post("/:id", auth, async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre.findByIdAndUpdate(
    req.params.id,
    { name: req.body.name },
    { new: true }
  );
  if (!genre) return res.status(400).send("Invalid");
  res.send(genre);
});

router.delete("/:id", [auth, isAdmin, authObjectId], async (req, res) => {
  const genre = Genre.findByIdAndRemove(req.params.id);
  if (!genre) return res.status(400).send("Invalid ID");

  res.send(genre);
});

module.exports = router;
