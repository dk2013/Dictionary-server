const express = require("express");
const session = require("express-session");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
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
// app.use(helmet()); // TODO: Uncomment this line for production
app.use(
  cors({
    origin: BASE_CLIENT_URL,
    credentials: true,
  }),
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true, // ensures the browser only sends cookie over https
      sameSite: "none", //TODO: recheck it on prod // needed if front-end is on a different domain or port
    },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("combined"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));
app.use(dictionariesRouter);
app.use(authRouter);

module.exports = app;
