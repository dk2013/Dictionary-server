const express = require("express");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const passport = require("./config/passport");
require("dotenv").config();

const dictionariesRouter = require("./routes/dictionaries/dictionaries.router");
const authRouter = require("./routes/auth/auth.routes");

const app = express();

const BASE_CLIENT_URL = process.env.BASE_CLIENT_URL;

connectDB();

// Middlewares
app.use(
  cors({
    origin: BASE_CLIENT_URL,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(dictionariesRouter);
app.use(authRouter);

module.exports = app;
