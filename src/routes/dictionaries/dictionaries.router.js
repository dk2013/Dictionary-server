const express = require("express");
const { getDictionary } = require("./dictionaries.controller");

const dictionariesRouter = express.Router();

 // how to get dictionary by id
dictionariesRouter.get("/dictionary/:id", async (req, res) => { await getDictionary(req, res) });

module.exports = dictionariesRouter;
