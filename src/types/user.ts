import { Document, Model } from "mongoose";

interface IUser {
  googleId: string;
  displayName: string;
  email: string;
}

interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {}

export { IUser, IUserDocument, IUserModel };
