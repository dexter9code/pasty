const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", {
    title: "PASTY",
    message: "WELCOME TO THE PASTY MOVIE RENTAL SERVICE",
  });
});

module.exports = router;
