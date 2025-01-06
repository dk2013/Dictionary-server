import { Request, Response } from "express";
import * as dictionaries from "../../models/dictionary.model";

/**
 * GET /dictionaries/:id
 */
export async function getDictionary(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.getDictionary(req, res, id);
}

/**
 * GET /dictionaries/users/:id
 */
export async function getDictionaryByUserId(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.getDictionaryByUserId(req, res, id);
}

/**
 * POST /dictionaries/:id/translations
 */
export async function saveTranslation(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.saveTranslation(req, res, id);
}

/**
 * DELETE /dictionaries/:id/translations
 */
export async function deleteTranslation(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.deleteTranslation(req, res, id);
}

/**
 * POST /dictionaries/:id/translate-from
 */
export async function createTranslationFrom(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.createTranslationFrom(req, res, id);
}

/**
 * POST /dictionaries/user/:id
 */
export async function createDictionary(req: Request, res: Response) {
  const { id } = req.params;
  return dictionaries.createDictionary(id);
}
