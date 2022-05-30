const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { User } = require("../model/user");

describe("user.genrateAuthToken", () => {
  it("should return valid json web token", () => {
    const payload = { _id: new mongoose.Types.ObjectId(), isAdmin: true };
    const user = new User(payload);

    const token = user.generateAuthToken();
    const decode = jwt.verify(token, process.env.JWT_PrivateKey);
    expect(decode).toMatchObject(payload);
  });
});
