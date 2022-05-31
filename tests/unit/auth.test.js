const mongoose = require("mongoose");

const { User } = require("../../model/user");
const auth = require("../../middleware/auth");

describe("auth midddleware", () => {
  it("should populate req.uesr with the payload of valid JWT", () => {
    const user = { _id: mongoose.Types.ObjectId(), isAdmin: true };
    const token = new User(user).generateAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();

    auth(req, res, next);
    expect(req.user).toMatchObject(user);
  });
});
