const express = require("express");
const {
  getDictionary,
  saveTranslation,
  createTranslateFrom,
  createDictionary,
} = require("./dictionaries.controller");

const dictionariesRouter = express.Router();

// how to get dictionary by id
dictionariesRouter.get("/dictionary/:id", async (req, res) => {
  await getDictionary(req, res);
});

dictionariesRouter.post(
  "/dictionary/:id/save-translation",
  async (req, res) => {
    await saveTranslation(req, res);
  }
);

dictionariesRouter.post("/dictionary/:id/translate-from", async (req, res) => {
  await createTranslateFrom(req, res);
});

dictionariesRouter.post("/dictionary/user/:id", async (req, res) => {
  await createDictionary(req, res);
});

module.exports = dictionariesRouter;
