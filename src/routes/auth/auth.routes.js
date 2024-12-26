// auth.routes.js
const express = require("express");
const passport = require("passport");

const authRouter = express.Router();

// Initiates Google OAuth flow
authRouter.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback URL that Google will redirect to after user consents
authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication
    res.redirect("/"); // Or wherever you want
  }
);

// Logout route
authRouter.get("/auth/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Protected route example (profile)
authRouter.get("/auth/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // user is logged in, show profile (or user data)
  res.json(req.user);
});

module.exports = authRouter;
