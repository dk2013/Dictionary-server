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
    translation: { type: String, required: true },
    modified: { type: Date, required: true },
    order: { type: Number, required: true },
  },
  { _id: false }
);

const TranslationToSchema = new mongoose.Schema(
  {
    type: Map,
    of: [TranslationSchema], // Keys like 'RUS', 'ESP' map to arrays of translations
  },
  { _id: false }
);

const WordSchema = new mongoose.Schema(
  {
    type: Map,
    of: TranslationToSchema, // Keys like 'water' map to a TranslationToSchema
  },
  { _id: false }
);

const TranslationFromSchema = new mongoose.Schema({
  type: Map,
  of: WordSchema, // Keys like 'ENG' or 'RUS' map to WordSchema
  _id: false,
});

// Main schema for the dictionaries collection
const DictionarySchema = new mongoose.Schema({
  dictionary: { type: Map, of: TranslationFromSchema, required: true },
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

async function createTranslateFrom(req, res, id) {
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

    if (
      !dictionaryObj?.dictionary ||
      !(dictionaryObj?.dictionary instanceof Map)
    ) {
      return res
        .status(404)
        .json({ message: "Dictionary property is not set" });
    }

    const translateFrom = "ENG";

    // Ensure the source language map exists
    if (!dictionaryObj.dictionary.has(translateFrom)) {
      dictionaryObj.dictionary.set(translateFrom, new Map());
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
  console.log("id:", id);

  const { newWord, translation, translateFrom, translateTo } = req.body;
  console.log("req.body:", newWord, translation, translateFrom, translateTo);

  try {
    const dictionaryObj = await Dictionary.findById(id);

    if (!dictionaryObj) {
      return res.status(404).json({ message: "Dictionary not found" });
    }

    // If dictionary doesn't exist yet, initialize it
    // if (!dictionaryObj.dictionary) {
    //   dictionaryObj.dictionary = new Map();
    // }

    let dictionary = dictionaryObj.dictionary;

    console.log("dictionary instanceof Map:", dictionary instanceof Map);

    // If dictionary is missing or not a Map, convert it
    if (!dictionary || !(dictionary instanceof Map)) {
      dictionaryObj.dictionary = new Map(Object.entries(dictionary || {}));
      dictionaryObj.dictionary = dictionary;
    }

    console.log(
      "dictionaryObj.dictionary instanceof Map:",
      dictionaryObj.dictionary instanceof Map
    );
    console.log("dictionaryObj.dictionary", dictionaryObj.dictionary);

    // Ensure the source language map exists
    if (!dictionaryObj.dictionary.has(translateFrom)) {
      dictionaryObj.dictionary.set(translateFrom, new Map());
    }
    const fromMap = dictionaryObj.dictionary.get(translateFrom);

    // Ensure the word map exists
    if (!fromMap.has(newWord)) {
      // If the new word doesn't exist, we create a new Map for it
      // The value is a Map from target language (translateTo) to an array of translations
      const newWordMap = new Map();

      // Initialize the target language array of translations
      newWordMap.set(translateTo, [
        {
          translation: translation,
          modified: new Date(),
          order: 1,
        },
      ]);

      fromMap.set(newWord, newWordMap);
    } else {
      // If the word exists, we add or update the translation
      const wordMap = fromMap.get(newWord);

      if (!wordMap.has(translateTo)) {
        wordMap.set(translateTo, [
          {
            translation: translation,
            modified: new Date(),
            order: 1,
          },
        ]);
      } else {
        const translations = wordMap.get(translateTo);
        // Check if translation already exists
        const existing = translations.find(
          (t) => t.translation === translation
        );
        if (existing) {
          existing.modified = new Date();
        } else {
          translations.push({
            translation: translation,
            modified: new Date(),
            order: translations.length + 1,
          });
        }
      }
    }

    // Mark dictionary field as modified
    dictionaryObj.markModified("dictionary");

    // Save the updated document
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

module.exports = {
  getDictionary,
  saveTranslation,
  Dictionary,
  createTranslateFrom,
  createDictionary,
};
