import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";

dotenv.config();

import { User, createUser } from "../models/user.model";
import { createDictionary } from "../models/dictionary.model";
import { IUser, IUserDocument } from "../types/user";
import { dummyDictionary } from "../mocks/dictionary";

/**
 * Configure the Google OAuth strategy
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: `${process.env.API_URL}/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find user by googleId
        let user: IUserDocument | null = await User.findOne({
          googleId: profile.id,
        });

        // If not found, create a new user
        if (!user) {
          const newUser: IUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails?.[0]?.value as string,
          };

          user = await createUser(newUser);
          // Create a default dictionary for the new user
          await createDictionary(user.id, dummyDictionary);
        }

        return done(null, user);
      } catch (e) {
        return done(e, undefined);
      }
    },
  ),
);

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUserDocument).id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (e) {
    done(e, null);
  }
});

export default passport;
