import mongoose, { Document } from "mongoose";
import { Request, Response } from "express";
import { transformDictionaryFromDbToClient } from "../utils/dictionary";

// TODO: refine this interface to get more explicit types.
export interface IDictionary {
  [key: string]: any; // e.g., { ENG: { water: { RUS: [...] } } }
}

export interface IDictionaryDocument extends Document {
  dictionary: IDictionary;
  user_id: mongoose.Types.ObjectId;

  markModified(path: string): void;

  save(): Promise<this>;
}

const TranslationSchema = new mongoose.Schema(
  {
    translation: { type: String, required: false },
    modified: { type: Date, required: false },
    order: { type: Number, required: false },
  },
  { _id: false },
);

const TranslationToSchema = new mongoose.Schema(
  {
    type: Object,
    // Keys like 'RUS', 'ESP' map to arrays of translations
    of: [TranslationSchema],
  },
  { _id: false },
);

const WordSchema = new mongoose.Schema(
  {
    type: Object,
    // Keys like 'water' map to a TranslationToSchema
    of: TranslationToSchema,
  },
  { _id: false },
);

const TranslationFromSchema = new mongoose.Schema(
  {
    type: Object,
    // Keys like 'ENG' or 'RUS' map to WordSchema
    of: WordSchema,
  },
  { _id: false },
);

// Main schema for the dictionaries collection
const DictionarySchema = new mongoose.Schema({
  dictionary: { type: Object, of: TranslationFromSchema, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

// Mongoose model
export const Dictionary = mongoose.model<IDictionaryDocument>(
  "Dictionary",
  DictionarySchema,
);

/**
 * GET /dictionaries/:id
 */
export async function getDictionary(req: Request, res: Response, id: string) {
  try {
    const dictionaryObj = await getDictionaryObject(id);
    if (!validateDictionaryObject(dictionaryObj, res)) return;
    res.status(200).json(dictionaryObj.dictionary);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}

/**
 * GET /dictionaries/users/:id
 */
export async function getDictionaryByUserId(
  req: Request,
  res: Response,
  userId: string,
) {
  try {
    const dictionaryObj = await getDictionaryObjectByUserId(userId);
    if (!validateDictionaryObject(dictionaryObj, res)) return;
    res.status(200).json(transformDictionaryFromDbToClient(dictionaryObj));
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
}

/**
 * This method is for testing
 * Creates or updates the translation "from" field in a dictionary object.
 *
 * @param req - Express request
 * @param res - Express response
 * @param id - dictionary document _id
 */
export async function createTranslationFrom(
  req: Request,
  res: Response,
  id: string,
) {
  try {
    const dictionaryObj = await getDictionaryObject(id);
    if (!validateDictionaryObject(dictionaryObj, res)) return;

    console.log("dictionaryObj:", dictionaryObj);
    console.log(
      "dictionaryObj instanceof Map (bool):",
      dictionaryObj instanceof Map,
    );

    const translationFrom = "ENG";

    // Ensure the source language exists
    if (!dictionaryObj.dictionary[translationFrom]) {
      console.log("here - updating");
      // As an example, assigning a nested map:
      dictionaryObj.dictionary[translationFrom] = {
        word1: new Map([
          ["RUS", [{ translation: "tran555", modified: new Date(), order: 1 }]],
        ]),
      };
      console.log("dictionaryObj.dictionary:", dictionaryObj.dictionary);
    }

    dictionaryObj.markModified("dictionary");
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translate From saved successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e: any) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

/**
 * Creates a new dictionary document for a user.
 */
export async function createDictionary(
  userId: string,
  dictionary?: IDictionary,
) {
  try {
    const dictionaryObj = new Dictionary({
      dictionary: dictionary || {},
      user_id: userId,
    });
    await dictionaryObj.save();
  } catch (e) {
    console.error("Error creating new dictionary:", e);
  }
}

/**
 * POST /dictionaries/:id/translations
 */
export async function saveTranslation(req: Request, res: Response, id: string) {
  const { newWord, translation, translationFrom, translationTo } = req.body;

  try {
    const dictionaryObj = await getDictionaryObject(id);
    if (!validateDictionaryObject(dictionaryObj, res)) return;

    const currentTranslation = getCurrentTranslation(
      dictionaryObj.dictionary,
      newWord,
      translationFrom,
      translationTo,
    );

    // Delete current reversed translation
    if (currentTranslation) {
      delete dictionaryObj.dictionary[translationTo][currentTranslation];
    }

    // Save direct translation
    dictionaryObj.dictionary[translationFrom] = prepareTranslationObjectToSave(
      dictionaryObj.dictionary,
      newWord,
      translation,
      translationFrom,
      translationTo,
    );

    // Save reversed translation
    dictionaryObj.dictionary[translationTo] = prepareTranslationObjectToSave(
      dictionaryObj.dictionary,
      translation,
      newWord,
      translationTo,
      translationFrom,
    );

    dictionaryObj.markModified("dictionary");
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translation saved successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e: any) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

/**
 * DELETE /dictionaries/:id/translations
 */
export async function deleteTranslation(
  req: Request,
  res: Response,
  id: string,
) {
  const { newWord, translationFrom, translationTo } = req.query;

  // query params are always string or undefined, so might need to cast them:
  const word = String(newWord || "");
  const from = String(translationFrom || "");
  const to = String(translationTo || "");

  console.log("params:", { newWord, translationFrom, translationTo });

  try {
    const dictionaryObj = await getDictionaryObject(id);
    if (!validateDictionaryObject(dictionaryObj, res)) return;

    const currentTranslation = getCurrentTranslation(
      dictionaryObj.dictionary,
      word,
      from,
      to,
    );

    // Delete current direct translation
    if (from in dictionaryObj.dictionary) {
      if (word in dictionaryObj.dictionary[from]) {
        delete dictionaryObj.dictionary[from][word];
      }

      if (!Object.keys(dictionaryObj.dictionary[from]).length) {
        delete dictionaryObj.dictionary[from];
      }
    }

    // Delete current reversed translation
    if (currentTranslation) {
      delete dictionaryObj.dictionary[to][currentTranslation];

      if (!Object.keys(dictionaryObj.dictionary[to]).length) {
        delete dictionaryObj.dictionary[to];
      }
    }

    dictionaryObj.markModified("dictionary");
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translation deleted successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e: any) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

/**
 * Utility function to prepare translation object
 */
function prepareTranslationObjectToSave(
  dictionary: IDictionary,
  newWord: string,
  translation: string,
  translationFrom: string,
  translationTo: string,
) {
  const sourceLang = dictionary[translationFrom] || {};
  const wordTranslations = sourceLang[newWord] || {};
  const translationsArray = wordTranslations[translationTo] || [];

  if (translationsArray.length === 0) {
    translationsArray.push({ translation, modified: new Date(), order: 1 });
  } else {
    translationsArray[0] = {
      ...translationsArray[0],
      translation,
      modified: new Date(),
    };
  }

  return {
    ...sourceLang,
    [newWord]: {
      ...wordTranslations,
      [translationTo]: translationsArray,
    },
  };
}

function getCurrentTranslation(
  dictionary: IDictionary,
  newWord: string,
  translationFrom: string,
  translationTo: string,
) {
  if (
    dictionary[translationFrom]?.[newWord]?.[translationTo]?.[0]?.translation
  ) {
    return dictionary[translationFrom][newWord][translationTo][0].translation;
  }
  return undefined;
}

/**
 * Fetch dictionary by user ID
 */
async function getDictionaryObjectByUserId(userId: string) {
  const dictionaryObj = await Dictionary.findOne({
    user_id: new mongoose.Types.ObjectId(userId),
  });
  return dictionaryObj;
}

/**
 * Fetch dictionary by its _id
 */
async function getDictionaryObject(id: string) {
  const dictionaryObj = await Dictionary.findById(id);
  return dictionaryObj;
}

function validateDictionaryObject(
  dictionaryObj: IDictionaryDocument | null,
  res: Response,
): dictionaryObj is IDictionaryDocument {
  if (!dictionaryObj) {
    res.status(404).json({ message: "Dictionary not found" });
    return false;
  }
  if (!dictionaryObj.dictionary) {
    res.status(404).json({ message: "dictionary property is empty" });
    return false;
  }
  return true;
}
