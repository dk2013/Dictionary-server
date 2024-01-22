const dictionaries = require("../../models/dictionaries.model");

function getDictionary(req, res) {
  return res.status(200).json(dictionaries);
}

module.exports = {
  getDictionary,
};
