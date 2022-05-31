const request = require("supertest");
const mongoose = require("mongoose");

const { Genre } = require("../../model/genre");
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
});
