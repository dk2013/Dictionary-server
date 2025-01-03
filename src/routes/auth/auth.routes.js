const express = require("express");
const passport = require("passport");
const { transformUserFromDbToClient } = require("../../Utils/user");

const authRouter = express.Router();

// Initiates Google OAuth flow
authRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // <-- forces the "choose account" screen
  }),
);

// Callback URL that Google will redirect to after user consents
authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.BASE_CLIENT_URL,
    successRedirect: process.env.BASE_CLIENT_URL,
    // session: true, // It's not necessary to specify this option, because the default value is true
  }),
  () => {
    // Successful authentication
    console.log("Google callback - auth success");
  },
);

// Logout route
authRouter.get("/auth/logout", (req, res, next) => {
  req.logout((e) => {
    if (e) return next(e);
    res.redirect(process.env.BASE_CLIENT_URL);
  });
});

// Protected route example (profile)
authRouter.get("/auth/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  // user is logged in, show profile (or user data)
  res.json(transformUserFromDbToClient(req.user));
});

module.exports = authRouter;
