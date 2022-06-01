const express = require("express");
const router = express.Router();
const moment = require("moment");

const { Rental } = require("../model/rental");
const { Movie } = require("../model/movie");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send("customer Id is not provided");
  if (!req.body.movieId)
    return res.status(400).send("Movie Id is not provided");

  let rental = await Rental.lookup(req.body.customerId, req.body.movieId);
  if (!rental) return res.status(404).send("NO rental Found ");

  if (rental.dateReturned)
    return res.status(400).send("Rental already processed");

  rental.dateReturned = new Date();
  rental.rentalFee =
    moment().diff(rental.dateOut, "days") * rental.movie.dailyRentalRate;
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movieId },
    { $inc: { numberInStock: 1 } }
  );

  return res.status(200).send(rental);
});

module.exports = router;
