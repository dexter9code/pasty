const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.json());

//connection with mongodb
mongoose
  .connect(process.env.db)
  .then(() => console.log("connected to the mongodb..."))
  .catch((error) =>
    console.log("error while connecting with mongodb...", error)
  );

const port = process.env.PORT || 2323;
app.listen(port, () => console.log(`listening on the ${port}`));
