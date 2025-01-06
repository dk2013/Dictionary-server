import { IDictionaryDocument } from "../models/dictionary.model";

/**
 * Transforms a Dictionary document from the database into a simplified object
 * for the client.
 */
export function transformDictionaryFromDbToClient(
  dictionaryObj: IDictionaryDocument,
) {
  return {
    id: dictionaryObj._id, // Mongoose Document's ID
    user_id: dictionaryObj.user_id, // the user's ObjectId reference
    dictionary: dictionaryObj.dictionary, // the nested dictionary structure
  };
}
