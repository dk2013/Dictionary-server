const dictionaries = require("../../models/dictionaries.model");

async function getDictionary(req, res) {
  const { id } = req.params;
  return await dictionaries.getDictionary(req, res, id);
}

module.exports = {
  getDictionary,
};
