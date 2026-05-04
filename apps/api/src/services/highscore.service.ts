import { AppError } from '../middlewares/error.middleware';
import * as highscoreRepo from '../repositories/highscore.repository';
import type { Highscore, CreateHighscoreRequest } from '@quizzy/types';
import { validatePlayerName, sanitizeString } from '@quizzy/utils';

export async function getHighscores(): Promise<Highscore[]> {
  return highscoreRepo.fetchTopHighscores(10);
}

export async function addHighscore(body: CreateHighscoreRequest): Promise<Highscore> {
  const { player_name, score_total, score_correct } = body;

  const nameValidation = validatePlayerName(player_name ?? '');
  if (!nameValidation.valid) {
    throw new AppError(400, nameValidation.error ?? 'Invalid player name');
  }

  if (typeof score_total !== 'number' || score_total < 1) {
    throw new AppError(400, 'score_total must be a positive number');
  }

  if (typeof score_correct !== 'number' || score_correct < 0) {
    throw new AppError(400, 'score_correct must be a non-negative number');
  }

  if (score_correct > score_total) {
    throw new AppError(400, 'score_correct cannot exceed score_total');
  }

  const sanitizedName = sanitizeString(player_name, 15);

  return highscoreRepo.createHighscore(sanitizedName, score_total, score_correct);
}
