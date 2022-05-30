const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

const home = require("./routes/home");
const movies = require("./routes/movies");
const genres = require("./routes/genres");
const customers = require("./routes/customers");

app.use(express.json());
app.use("/", home);
app.use("/pasty/movies", movies);
app.use("/pasty/genres", genres);
app.use("/pasty/customers", customers);

//templates engine
app.set("view engine", "pug");
app.set("views", "./views");

//connection with mongodb
mongoose
  .connect(process.env.db)
  .then(() => console.log("connected to the mongodb..."))
  .catch((error) =>
    console.log("error while connecting with mongodb...", error)
  );

const port = process.env.PORT || 2323;
app.listen(port, () => console.log(`listening on the ${port}`));
