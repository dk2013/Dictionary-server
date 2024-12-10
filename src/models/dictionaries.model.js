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

// const DictionarySchema = new mongoose.Schema({
//   dictionary: {
//     language: { type: String, required: true },
//     word: { type: String, required: true },
//     translations: [
//       {
//         language: { type: String, required: true },
//         translation: { type: String, required: true },
//         modified: { type: Date, default: Date.now },
//         order: { type: Number, required: true },
//       },
//     ]
//   },
//   user_id: { type: mongoose.Schema.Types.ObjectId, required: true }
// });

// Schema for individual translations
const TranslationSchema = new mongoose.Schema({
  translation: { type: String, required: true },
  modified: { type: Date, required: true },
  order: { type: Number, required: true },
});

// Schema for a dynamic language object (e.g., RUS, ENG, ESP, etc.)
const LanguageSchema = new mongoose.Schema({
  type: Map,
  of: [TranslationSchema], // Each key (e.g., RUS) maps to an array of translations
});

// Schema for the entire dictionary
const DictionarySchema = new mongoose.Schema({
  type: Map,
  of: LanguageSchema, // Each key (e.g., ENG, RUS) maps to a LanguageSchema
});

// Main schema for the dictionaries collection
const DictionariesSchema = new mongoose.Schema({
  dictionary: DictionarySchema,
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
});

const Dictionary = mongoose.model("Dictionary", DictionariesSchema);

async function getDictionary(req, res, id) {
  try {
    const dictionaryObj = await Dictionary.findById(id);
    res.status(200).json(dictionaryObj?.dictionary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  getDictionary,
};
