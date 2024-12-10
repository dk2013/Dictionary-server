const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
require('dotenv').config();

const dictionariesRouter = require("./routes/dictionaries/dictionaries.router");

const app = express();

const BASE_CLIENT_URL = "http://localhost:3000";

connectDB();

// Middlewares
app.use(
  cors({
    origin: BASE_CLIENT_URL,
  })
);
app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(dictionariesRouter);

module.exports = app;
