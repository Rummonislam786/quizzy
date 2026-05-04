import { Request, Response, NextFunction } from 'express';
import * as highscoreService from '../services/highscore.service';
import type { CreateHighscoreRequest } from '@quizzy/types';

export async function getHighscores(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const highscores = await highscoreService.getHighscores();
    res.json(highscores);
  } catch (err) {
    next(err);
  }
}

export async function createHighscore(
  req: Request<object, object, CreateHighscoreRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const highscore = await highscoreService.addHighscore(req.body);
    res.status(201).json(highscore);
  } catch (err) {
    next(err);
  }
}
