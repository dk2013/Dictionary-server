const dictionaries = require("../../models/dictionaries.model");

async function getDictionary(req, res) {
  const { id } = req.params;
  return await dictionaries.getDictionary(req, res, id);
}

async function saveTranslation(req, res) {
  const { id } = req.params;
  return await dictionaries.saveTranslation(req, res, id);
}

async function createTranslateFrom(req, res) {
  const { id } = req.params;
  return await dictionaries.createTranslateFrom(req, res, id);
}

async function createDictionary(req, res) {
  const { id } = req.params;
  return await dictionaries.createDictionary(req, res, id);
}

module.exports = {
  getDictionary,
  saveTranslation,
  createTranslateFrom,
  createDictionary,
};
