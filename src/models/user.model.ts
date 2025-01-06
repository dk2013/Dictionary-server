import mongoose from "mongoose";
import { IUser, IUserDocument, IUserModel } from "../types/user";

const UserSchema = new mongoose.Schema<IUserDocument>({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
});

const User = mongoose.model<IUserDocument, IUserModel>("User", UserSchema);

async function createUser(user: IUser): Promise<IUserDocument> {
  const newUser = new User(user);
  await newUser.save();
  return newUser;
}

export { User, createUser };
