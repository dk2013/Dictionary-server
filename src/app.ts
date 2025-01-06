import express from "express";
import session from "express-session";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

import connectDB from "./config/db";
import passport from "./config/passport";

import dictionariesRouter from "./routes/dictionaries/dictionaries.router";
import authRouter from "./routes/auth/auth.routes";

const app = express();
const BASE_CLIENT_URL = process.env.BASE_CLIENT_URL;

connectDB();

// Middlewares
// app.use(helmet()); // Uncomment in production or as needed

app.use(
  cors({
    origin: BASE_CLIENT_URL,
    credentials: true,
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "someSecretKey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      secure: true, // ensures the browser only sends cookie over https
      sameSite: "none", // needed if front-end is on a different domain/port
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(morgan("combined"));
app.use(express.json());

// Serve static files from "../public"
app.use(express.static(path.join(__dirname, "..", "public")));

// Add routes
app.use(dictionariesRouter);
app.use(authRouter);

export default app;
