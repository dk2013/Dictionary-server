const express = require("express");
const cors = require("cors");

const dictionariesRouter = require("./routes/dictionaries/dictionaries.router");

const app = express();

const BASE_CLIENT_URL = "http://localhost:3000";

// Middlewares
app.use(
  cors({
    origin: BASE_CLIENT_URL,
  })
);
app.use(express.json());
app.use(dictionariesRouter);

module.exports = app;
