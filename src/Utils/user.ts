import { IUserDocument } from "../types/user";

export const transformUserFromDbToClient = (user: IUserDocument) => {
  return {
    id: user._id,
    displayName: user.displayName,
  };
};
