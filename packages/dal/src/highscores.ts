import pool from './pool';
import type { Highscore } from '@quizzy/types';

export async function getTopHighscores(limit = 10): Promise<Highscore[]> {
  const result = await pool.query<Highscore>(
    `SELECT id, player_name, score_total, score_correct, created_at
     FROM highscores
     ORDER BY score_correct DESC, score_total ASC, created_at ASC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

export async function insertHighscore(
  player_name: string,
  score_total: number,
  score_correct: number
): Promise<Highscore> {
  const result = await pool.query<Highscore>(
    `INSERT INTO highscores (player_name, score_total, score_correct)
     VALUES ($1, $2, $3)
     RETURNING id, player_name, score_total, score_correct, created_at`,
    [player_name, score_total, score_correct]
  );
  return result.rows[0];
}
