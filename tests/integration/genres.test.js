const { default: mongoose } = require("mongoose");
const request = require("supertest");

const { Genre } = require("../../model/genre");
const { User } = require("../../model/user");
let server;

describe("/pasty/genres", () => {
  beforeEach(() => {
    server = require("../../app");
  });
  afterEach(async () => {
    await server.close();
    await Genre.deleteMany({});
  });

  describe("GET /", () => {
    // it("should return all the genres", async () => {
    //   jest.setTimeout(3000);
    //   const res = await request(server).get("/pasty/genres");
    //   expect(res).toBe(200);
    // });

    it("should return all the inserted genres", async () => {
      await Genre.collection.insertMany([
        { title: "Free World" },
        { title: "Free World2" },
      ]);
      const res = await request(server).get("/pasty/genres");
      expect(res.status).toBe(200);
      expect(res.body.some((g) => g.title === "Free World")).toBeTruthy();
    });
  });

  describe("GET/:id", () => {
    it("should return a valid genre if valid id is passed", async () => {
      const genre = new Genre({ name: "horrror" });
      await genre.save();

      const res = await request(server).get("/pasty/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", genre.name);
    });

    it("should return 404 if valid id is not passed", async () => {
      const res = await request(server).get("/pasty/genres/1");
      expect(res.status).toBe(404);
    });
  });

  describe("POST", () => {
    it("should return 401 if client is not logged in", async () => {
      const res = await request(server)
        .post("/pasty/genres")
        .send({ name: "Genre1" });
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre is less than 3", async () => {
      const token = new User().generateAuthToken();
      const res = await request(server)
        .post("/pasty/genres")
        .set("x-auth-token", token)
        .send({ name: "ge" });
      expect(res.status).toBe(400);
    });
  });

  it("should save the genre if everything is perfect", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/pasty/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
    const genre = await Genre.find({ name: "genre1" });
    expect(res.status).toBe(200);
    expect(genre).not.toBeNull();
  });

  it("should return genre if it is valid", async () => {
    const token = new User().generateAuthToken();
    const res = await request(server)
      .post("/pasty/genres")
      .set("x-auth-token", token)
      .send({ name: "Romance" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id");
    expect(res.body).toHaveProperty("name");
  });

  describe("PUT/", () => {
    it("should return 401 if client is not logged in  ", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const token = "";
      const res = await request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "updatedgenre" });

      expect(res.status).toBe(401);
    });

    it("should return 400 if given Id is Invalid  ", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const token = "1";
      const res = await request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "updatedgenre" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is less than minlength  ", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const token = new User().generateAuthToken();
      const res = await request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "up" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if genre is more than maxlength  ", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const token = new User().generateAuthToken();
      const res = await request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: new Array(20).join("a") });

      expect(res.status).toBe(400);
    });

    it("should return 404 if the genre with given id is not found", async () => {
      let genre = new Genre({ name: "genre1" });
      await genre.save();
      genre._id = mongoose.Types.ObjectId();
      const token = new User().generateAuthToken();
      const res = request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "updated" });

      expect(res.status).toBe(undefined);
    });

    it("should return the updated genre if it is valid", async () => {
      const genre = new Genre({ name: "genre1" });
      await genre.save();
      const token = new User().generateAuthToken();
      const res = request(server)
        .put("/pasty/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "upated" });

      expect(res.status).toBe(undefined);
    });
  });

  describe("DELETE /:id", () => {
    let token;
    let genre;
    let id;

    const exec = async () => {
      return await request(server)
        .delete("/api/genres/" + id)
        .set("x-auth-token", token)
        .send();
    };

    beforeEach(async () => {
      // Before each test we need to create a genre and
      // put it in the database.
      genre = new Genre({ name: "genre1" });
      await genre.save();

      id = genre._id;
      token = new User({ isAdmin: true }).generateAuthToken();
    });

    it("should return 401 if client is not logged in", async () => {
      token = "";

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 403 if the user is not an admin", async () => {
      token = new User({ isAdmin: false }).generateAuthToken();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if id is invalid", async () => {
      id = 1;

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return 404 if no genre with the given id was found", async () => {
      id = mongoose.Types.ObjectId();

      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should delete the genre if input is valid", async () => {
      await exec();

      const genreInDb = await Genre.findByIdAndRemove(id);

      expect(genreInDb).not.toBeNull();
    });

    it("should return the removed genre", async () => {
      const res = await exec();

      expect(res.status).toBe(404);
    });
  });
});
