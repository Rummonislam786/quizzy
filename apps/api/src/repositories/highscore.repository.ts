import { highscoresDAL } from '@quizzy/dal';
import type { Highscore } from '@quizzy/types';

export async function fetchTopHighscores(limit: number): Promise<Highscore[]> {
  return highscoresDAL.getTopHighscores(limit);
}

export async function createHighscore(
  player_name: string,
  score_total: number,
  score_correct: number
): Promise<Highscore> {
  return highscoresDAL.insertHighscore(player_name, score_total, score_correct);
}
