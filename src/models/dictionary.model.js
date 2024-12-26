/*
const dictionary = {
  ENG: {
    water: {
      RUS: [
        {
          translation: "вода",
          modified: "2019-05-12T03:04:32.000Z",
          order: 1,
        },
      ],
      ESP: [
        {
          translation: "agua",
          modified: "2019-05-12T03:04:32.000Z",
          order: 1,
        },
      ],
    },
    zombie: {
      RUS: [
        {
          translation: "зомби",
          modified: "2023-09-05T02:09:27.663Z",
          order: 1,
        },
      ],
    },
    grass: {
      RUS: [
        {
          translation: "трава",
          modified: "2023-09-05T02:09:42.814Z",
          order: 1,
        },
      ],
    },
    zebra: {
      RUS: [
        {
          translation: "зебра",
          modified: "2023-09-05T04:57:11.849Z",
          order: 1,
        },
      ],
    },
    mean: {
      RUS: [
        {
          translation: "жадный",
          modified: "2024-01-08T04:36:21.396Z",
          order: 1,
        },
      ],
    },
  },
  RUS: {
    вода: {
      ENG: [
        {
          translation: "water",
          modified: "2019-05-12T03:04:32.000Z",
          order: 1,
        },
      ],
    },
    зомби: {
      ENG: [
        {
          translation: "zombie",
          modified: "2023-09-05T02:09:27.663Z",
          order: 1,
        },
      ],
    },
    трава: {
      ENG: [
        {
          translation: "grass",
          modified: "2023-09-05T02:09:42.814Z",
          order: 1,
        },
      ],
    },
    зебра: {
      ENG: [
        {
          translation: "zebra",
          modified: "2023-09-05T04:57:11.849Z",
          order: 1,
        },
      ],
    },
    жадный: {
      ENG: [
        {
          translation: "mean",
          modified: "2024-01-08T04:36:21.396Z",
          order: 1,
        },
      ],
    },
  },
};
*/

const mongoose = require("mongoose");

const TranslationSchema = new mongoose.Schema(
  {
    translation: { type: String, required: false },
    modified: { type: Date, required: false },
    order: { type: Number, required: false },
  },
  { _id: false }
);

const TranslationToSchema = new mongoose.Schema(
  {
    type: Object,
    of: [TranslationSchema], // Keys like 'RUS', 'ESP' map to arrays of translations
  },
  { _id: false }
);

const WordSchema = new mongoose.Schema(
  {
    type: Object,
    of: TranslationToSchema, // Keys like 'water' map to a TranslationToSchema
  },
  { _id: false }
);

const TranslationFromSchema = new mongoose.Schema(
  {
    type: Object,
    of: WordSchema, // Keys like 'ENG' or 'RUS' map to WordSchema
  },
  { _id: false }
);
// Main schema for the dictionaries collection
const DictionarySchema = new mongoose.Schema({
  dictionary: { type: Object, of: TranslationFromSchema, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Dictionary = mongoose.model("Dictionary", DictionarySchema);

async function getDictionary(req, res, id) {
  try {
    const dictionaryObj = await Dictionary.findById(id);
    res.status(200).json(dictionaryObj?.dictionary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// This method is for testing
async function createTranslationFrom(req, res, id) {
  try {
    const dictionaryObj = await Dictionary.findById(id);

    if (!dictionaryObj) {
      return res.status(404).json({ message: "Dictionary not found" });
    }

    console.log("dictionaryObj:", dictionaryObj);
    console.log(
      "dictionaryObj instanceof Map (bool):",
      dictionaryObj instanceof Map
    );

    const translationFrom = "ENG";

    // Ensure the source language exists
    if (!dictionaryObj.dictionary[translationFrom]) {
      console.log("here - updating");

      dictionaryObj.dictionary[translationFrom] = {
        word1: new Map([
          ["RUS", [{ translation: "tran555", modified: new Date(), order: 1 }]],
        ]),
      };

      console.log("dictionaryObj.dictionary:", dictionaryObj.dictionary);
    }

    // Mark dictionary field as modified
    dictionaryObj.markModified("dictionary");

    // Save the updated document
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translate From saved successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

// This method is for testing
async function createDictionary(req, res, userId) {
  try {
    // Create a new document with an empty dictionary Map
    const newDict = new Dictionary({
      dictionary: { ENG: {} }, // Starts as an empty dictionary
      user_id: userId,
    });

    console.log("newDict:", newDict);

    await newDict.save();

    res.status(200).json({
      message: "Dictionary created successfully",
      dictionaryObj: newDict,
    });
  } catch (e) {
    console.error("Error creating new dictionary:", e);
    res.status(500).json({ message: e.message });
  }
}

async function saveTranslation(req, res, id) {
  const { newWord, translation, translationFrom, translationTo } = req.body;

  try {
    const dictionaryObj = await Dictionary.findById(id);
    if (!dictionaryObj) {
      return res.status(404).json({ message: "Dictionary not found" });
    }

    if (!"dictionary" in dictionaryObj) {
      return res.status(404).json({ message: "dictionary property is empty" });
    }

    const currentTranslation = getCurrentTranslation(
      dictionaryObj.dictionary,
      newWord,
      translationFrom,
      translationTo
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
      translationTo
    );

    // Save reversed translation
    dictionaryObj.dictionary[translationTo] = prepareTranslationObjectToSave(
      dictionaryObj.dictionary,
      translation,
      newWord,
      translationTo,
      translationFrom
    );

    dictionaryObj.markModified("dictionary");
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translation saved successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

async function deleteTranslation(req, res, id) {
  const { newWord, translationFrom, translationTo } = req.query;

  console.log("params:", { newWord, translationFrom, translationTo });

  try {
    const dictionaryObj = await Dictionary.findById(id);
    if (!dictionaryObj) {
      return res.status(404).json({ message: "Dictionary not found" });
    }

    if (!"dictionary" in dictionaryObj) {
      return res.status(404).json({ message: "dictionary property is empty" });
    }

    const currentTranslation = getCurrentTranslation(
      dictionaryObj.dictionary,
      newWord,
      translationFrom,
      translationTo
    );

    // Delete current direct translation
    if (translationFrom in dictionaryObj.dictionary) {
      if (newWord in dictionaryObj.dictionary[translationFrom]) {
        delete dictionaryObj.dictionary[translationFrom][newWord];
      }

      if (!Object.keys(dictionaryObj.dictionary[translationFrom]).length) {
        delete dictionaryObj.dictionary[translationFrom];
      }
    }

    // Delete current reversed translation
    if (currentTranslation) {
      delete dictionaryObj.dictionary[translationTo][currentTranslation];

      if (!Object.keys(dictionaryObj.dictionary[translationTo]).length) {
        delete dictionaryObj.dictionary[translationTo];
      }
    }

    dictionaryObj.markModified("dictionary");
    await dictionaryObj.save();

    res.status(200).json({
      message: "Translation saved successfully",
      dictionary: dictionaryObj.dictionary,
    });
  } catch (e) {
    console.error("Error:", e);
    res.status(500).json({ message: e.message });
  }
}

function prepareTranslationObjectToSave(
  dictionary,
  newWord,
  translation,
  translationFrom,
  translationTo
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
  dictionary,
  newWord,
  translationFrom,
  translationTo
) {
  if (
    dictionary[translationFrom]?.[newWord]?.[translationTo]?.[0]?.translation
  ) {
    return dictionary[translationFrom][newWord][translationTo][0].translation;
  }
}

module.exports = {
  getDictionary,
  saveTranslation,
  deleteTranslation,
  createTranslationFrom,
  createDictionary,
};
