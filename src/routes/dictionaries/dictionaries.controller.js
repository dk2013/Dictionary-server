const dictionaries = require("../../models/dictionary.model");

async function getDictionary(req, res) {
  const { id } = req.params;
  return await dictionaries.getDictionary(req, res, id);
}

async function getDictionaryByUserId(req, res) {
  const userId = req.params.id;
  return await dictionaries.getDictionaryByUserId(req, res, userId);
}

async function saveTranslation(req, res) {
  const { id } = req.params;
  return await dictionaries.saveTranslation(req, res, id);
}

async function deleteTranslation(req, res) {
  const { id } = req.params;
  return await dictionaries.deleteTranslation(req, res, id);
}

async function createTranslateFrom(req, res) {
  const { id } = req.params;
  return await dictionaries.createTranslationFrom(req, res, id);
}

async function createDictionary(req, res) {
  const { id } = req.params;
  return await dictionaries.createDictionary(req, res, id);
}

module.exports = {
  getDictionary,
  getDictionaryByUserId,
  saveTranslation,
  deleteTranslation,
  createTranslateFrom,
  createDictionary,
};
