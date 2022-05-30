const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) res.status(401).send("Access Denied");

  try {
    const decode = jwt.verify(token, process.env.JWT_PrivateKey);
    req.user = decode;
    next();
  } catch (error) {
    res.send(400).send(error);
  }
};
