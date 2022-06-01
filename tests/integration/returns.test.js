const request = require("supertest");
const mongoose = require("mongoose");
const moment = require("moment");

const { Rental } = require("../../model/rental");
const { User } = require("../../model/user");
const { Movie } = require("../../model/movie");

let server;
let rental;
let customerId;
let movieId;
let movie;

describe("/pasty/returns", () => {
  beforeEach(async () => {
    server = await require("../../app");

    customerId = mongoose.Types.ObjectId();
    movieId = mongoose.Types.ObjectId();

    movie = new Movie({
      _id: movieId,
      title: "Sonic runner",
      dailyRentalRate: 5,
      isAvailable: true,
      rating: 4,
      genre: { name: "cartoon" },
      numberInStock: 50,
    });
    await movie.save();

    rental = new Rental({
      customer: {
        _id: customerId,
        name: "john millan",
        phone: "8990878909",
      },
      movie: {
        _id: movieId,
        title: "Sonic runner",
        dailyRentalRate: 5,
      },
    });

    await rental.save();
  });

  afterEach(async () => {
    await server.close(),
      await Rental.deleteMany({}),
      await Movie.deleteMany({});
  });

  it("should return 401 if user is not logged in ", async () => {
    const res = await request(server)
      .post("/pasty/returns")
      .send({ movieId, customerId });
    expect(res.status).toBe(401);
  });

  it("should return 400 if customer ID is not provided", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ movieId });
    expect(res.status).toBe(400);
  });

  it("should return 400 if Movie ID is not provided", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId });
    expect(res.status).toBe(400);
  });

  it("should return 404 if rental of movie/customer not found", async () => {
    await Rental.deleteMany({});

    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
    expect(res.status).toBe(404);
  });

  it("should return 400 if rental is already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
    expect(res.status).toBe(400);
  });

  it("should return 200 if valid request is passed", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
    expect(res.status).toBe(200);
  });

  it("should set the return date if input is valid", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });

    const resultDb = await Rental.findById(rental._id);
    const diff = new Date() - resultDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should set the rentalFee if input is valid", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });

    const resultDb = await Rental.findById(rental._id);
    expect(resultDb.rentalFee).toBeDefined();
  });

  it("should return rental if everything is fine", async () => {
    const token = new User().generateAuthToken();

    const res = await request(server)
      .post("/pasty/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });

    const resultDb = await Rental.findById(rental._id);
    expect(res.body).toHaveProperty("dateOut");
    expect(res.body).toHaveProperty("dateReturned");

    // or we compare a array

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(["dateOut", "dateReturned", "rentalFee"])
    );
  });

  // it("should increase the Movie Stock", async () => {
  //   const token = new User().generateAuthToken();

  //   const res = await request(server)
  //     .post("/pasty/returns")
  //     .set("x-auth-token", token)
  //     .send({ customerId, movieId });

  //   const movie = await Movie.findById(movieId);
  //   expect(movie).toBe(movie.numberInStock + 1);
  // });
});
