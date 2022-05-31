const request = require("supertest");

const { User } = require("../../model/user");
const { Genre } = require("../../model/genre");
let server;

describe("Auth Middleware", () => {
  beforeEach(() => (server = require("../../app")));
  afterEach(async () => await server.close());

  let token;
  const exec = () => {
    return request(server)
      .post("/pasty/genres")
      .set("x-auth-token", token)
      .send({ name: "Romance" });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
  });

  it("should return 401 if not token is provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if token is Invalid", async () => {
    token = "1";
    const res = await exec();
    expect(res.status).toBe(400);
  });
});
