const express = require("express");
const { getDictionary } = require("./dictionaries.controller");

const dictionariesRouter = express.Router();

dictionariesRouter.get("/dictionary/", getDictionary);

module.exports = dictionariesRouter;
