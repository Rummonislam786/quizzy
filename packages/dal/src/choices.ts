import pool from "./pool";
import { Choice } from "@quizzy/types";

export async function insertChoice(
  question_id: number,
  choice_text: string,
  is_correct: boolean,
): Promise<Choice> {
  const result = await pool.query<Choice>(
    `INSERT INTO choices (question_id, choice_text, is_correct)
     VALUES ($1, $2, $3)
     RETURNING id, question_id, choice_text, is_correct`,
    [question_id, choice_text, is_correct],
  );
  return result.rows[0];
}

export async function deleteChoicesByQuestionId(
  question_id: number,
): Promise<void> {
  await pool.query(`DELETE FROM choices WHERE question_id = $1`, [question_id]);
}

export async function getChoiceById(id: number): Promise<Choice | null> {
  const result = await pool.query<Choice>(
    `SELECT id, question_id, choice_text, is_correct FROM choices WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}
