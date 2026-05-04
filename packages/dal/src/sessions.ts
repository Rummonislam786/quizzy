import pool from './pool';
import type { QuizSession } from '@quizzy/types';

export async function createSession(): Promise<QuizSession> {
  const result = await pool.query<QuizSession>(
    `INSERT INTO quiz_sessions DEFAULT VALUES RETURNING id, created_at`
  );
  return result.rows[0];
}

export async function insertSessionQuestions(
  session_id: string,
  question_ids: number[]
): Promise<void> {
  if (question_ids.length === 0) return;

  const values = question_ids
    .map((_, i) => `($1, $${i + 2})`)
    .join(', ');

  await pool.query(
    `INSERT INTO quiz_session_questions (session_id, question_id) VALUES ${values}`,
    [session_id, ...question_ids]
  );
}

export async function getSessionQuestionIds(session_id: string): Promise<number[]> {
  const result = await pool.query<{ question_id: number }>(
    `SELECT question_id FROM quiz_session_questions WHERE session_id = $1`,
    [session_id]
  );
  return result.rows.map((r) => r.question_id);
}

export async function sessionExists(session_id: string): Promise<boolean> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) FROM quiz_sessions WHERE id = $1`,
    [session_id]
  );
  return parseInt(result.rows[0].count, 10) > 0;
}
