const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, createUser } = require("../models/user.model");
const {
  dummyDictionary,
  createDictionary,
} = require("../models/dictionary.model");
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
          };
          user = await createUser(newUser);

          // Create a default dictionary
          await createDictionary(user.id, dummyDictionary);
        }
        done(null, user);
      } catch (e) {
        done(e, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

module.exports = passport;
