import { Router, Request, Response, NextFunction } from "express";
import passport from "passport";
import { transformUserFromDbToClient } from "../../Utils/user";
import { IUserDocument } from "../../types/user";

const authRouter = Router();

// Initiates Google OAuth flow
authRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account", // Forces the "choose account" screen
  }),
);

// Callback URL that Google will redirect to after user consents
authRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.BASE_CLIENT_URL,
    successRedirect: process.env.BASE_CLIENT_URL,
    // session: true, // not necessary to specify; it's true by default
  }),
  () => {
    // Successful authentication
    console.log("Google callback - auth success");
  },
);

// Logout route
authRouter.get(
  "/auth/logout",
  (req: any, res: Response, next: NextFunction) => {
    // `req.logout` is added by Passport, so if you're on Passport v0.6+,
    // it may require a callback or return a promise.
    req.logout((e: unknown) => {
      if (e) return next(e);
      res.redirect(process.env.BASE_CLIENT_URL || "/");
    });
  },
);

// Protected route (profile)
authRouter.get("/auth/profile", (req: Request, res: Response): Promise<any> => {
  return new Promise((resolve) => {
    // `req.isAuthenticated()` and `req.user` are Passport-specific
    if (!req.isAuthenticated()) {
      return resolve(res.status(401).json({ message: "Not authenticated" }));
    }

    // user is logged in, show profile
    // Adjust the `transformUserFromDbToClient` signature as needed
    resolve(res.json(transformUserFromDbToClient(req.user as IUserDocument)));
  });
});

export default authRouter;
