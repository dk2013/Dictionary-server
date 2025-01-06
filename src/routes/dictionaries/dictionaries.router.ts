import { Router, Request, Response } from "express";
import {
  getDictionary,
  getDictionaryByUserId,
  saveTranslation,
  createTranslationFrom,
  deleteTranslation,
  createDictionary,
} from "./dictionaries.controller";

const dictionariesRouter = Router();

/**
 * GET /dictionaries/:id
 */
dictionariesRouter.get(
  "/dictionaries/:id",
  async (req: Request, res: Response) => {
    await getDictionary(req, res);
  },
);

/**
 * GET /dictionaries/users/:id
 */
dictionariesRouter.get(
  "/dictionaries/users/:id",
  async (req: Request, res: Response) => {
    await getDictionaryByUserId(req, res);
  },
);

/**
 * POST /dictionaries/:id/translations
 */
dictionariesRouter.post(
  "/dictionaries/:id/translations",
  async (req: Request, res: Response) => {
    await saveTranslation(req, res);
  },
);

/**
 * DELETE /dictionaries/:id/translations
 */
dictionariesRouter.delete(
  "/dictionaries/:id/translations",
  async (req: Request, res: Response) => {
    await deleteTranslation(req, res);
  },
);

/**
 * POST /dictionaries/:id/translate-from
 */
dictionariesRouter.post(
  "/dictionaries/:id/translate-from",
  async (req: Request, res: Response) => {
    await createTranslationFrom(req, res);
  },
);

/**
 * POST /dictionaries/user/:id
 */
dictionariesRouter.post(
  "/dictionaries/user/:id",
  async (req: Request, res: Response) => {
    await createDictionary(req, res);
  },
);

export default dictionariesRouter;
