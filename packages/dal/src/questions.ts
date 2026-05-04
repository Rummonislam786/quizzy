import pool from './pool';
import type { Question, Choice } from '@quizzy/types';

export async function getRandomQuestionIds(limit: number): Promise<number[]> {
  // Efficient random selection: get all IDs, shuffle in app layer
  // For large tables, use TABLESAMPLE or reservoir sampling
  const result = await pool.query<{ id: number }>(
    `SELECT id FROM questions ORDER BY random() LIMIT $1`,
    [limit]
  );
  return result.rows.map((r) => r.id);
}

export async function getQuestionsByIds(ids: number[]): Promise<Question[]> {
  if (ids.length === 0) return [];

  const result = await pool.query<Question>(
    `SELECT id, question_text, explanation_text, created_at
     FROM questions
     WHERE id = ANY($1::int[])`,
    [ids]
  );
  return result.rows;
}

export async function getChoicesByQuestionIds(questionIds: number[]): Promise<Choice[]> {
  if (questionIds.length === 0) return [];

  const result = await pool.query<Choice>(
    `SELECT id, question_id, choice_text, is_correct
     FROM choices
     WHERE question_id = ANY($1::int[])
     ORDER BY question_id, id`,
    [questionIds]
  );
  return result.rows;
}

export async function getQuestionsWithPagination(
  search: string,
  limit: number,
  offset: number
): Promise<{ rows: Question[]; total: number }> {
  const searchParam = `%${search}%`;

  const [dataResult, countResult] = await Promise.all([
    pool.query<Question>(
      `SELECT id, question_text, explanation_text, created_at
       FROM questions
       WHERE question_text ILIKE $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchParam, limit, offset]
    ),
    pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM questions WHERE question_text ILIKE $1`,
      [searchParam]
    ),
  ]);

  return {
    rows: dataResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

export async function getQuestionById(id: number): Promise<Question | null> {
  const result = await pool.query<Question>(
    `SELECT id, question_text, explanation_text, created_at FROM questions WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function insertQuestion(
  question_text: string,
  explanation_text: string
): Promise<Question> {
  const result = await pool.query<Question>(
    `INSERT INTO questions (question_text, explanation_text)
     VALUES ($1, $2)
     RETURNING id, question_text, explanation_text, created_at`,
    [question_text, explanation_text]
  );
  return result.rows[0];
}

export async function updateQuestion(
  id: number,
  question_text: string,
  explanation_text: string
): Promise<Question | null> {
  const result = await pool.query<Question>(
    `UPDATE questions
     SET question_text = $1, explanation_text = $2
     WHERE id = $3
     RETURNING id, question_text, explanation_text, created_at`,
    [question_text, explanation_text, id]
  );
  return result.rows[0] ?? null;
}

export async function deleteQuestion(id: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM questions WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function getTotalQuestionCount(): Promise<number> {
  const result = await pool.query<{ count: string }>(`SELECT COUNT(*) FROM questions`);
  return parseInt(result.rows[0].count, 10);
}
