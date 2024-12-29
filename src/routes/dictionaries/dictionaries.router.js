const express = require("express");
const {
  getDictionary,
  getDictionaryByUserId,
  saveTranslation,
  createTranslateFrom,
  deleteTranslation,
  createDictionary,
} = require("./dictionaries.controller");

const dictionariesRouter = express.Router();

dictionariesRouter.get("/dictionaries/:id", async (req, res) => {
  await getDictionary(req, res);
});

dictionariesRouter.get("/dictionaries/users/:id", async (req, res) => {
  await getDictionaryByUserId(req, res);
});

dictionariesRouter.post("/dictionaries/:id/translations", async (req, res) => {
  await saveTranslation(req, res);
});

dictionariesRouter.delete(
  "/dictionaries/:id/translations",
  async (req, res) => {
    await deleteTranslation(req, res);
  },
);

dictionariesRouter.post(
  "/dictionaries/:id/translate-from",
  async (req, res) => {
    await createTranslateFrom(req, res);
  },
);

dictionariesRouter.post("/dictionaries/user/:id", async (req, res) => {
  await createDictionary(req, res);
});

module.exports = dictionariesRouter;
