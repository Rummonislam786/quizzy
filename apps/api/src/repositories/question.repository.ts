import { questionsDAL, choicesDAL } from '@quizzy/dal';
import type { Question, Choice } from '@quizzy/types';

export async function fetchQuestionsWithPagination(
  search: string,
  limit: number,
  offset: number
): Promise<{ rows: Question[]; total: number }> {
  return questionsDAL.getQuestionsWithPagination(search, limit, offset);
}

export async function fetchQuestionById(id: number): Promise<Question | null> {
  return questionsDAL.getQuestionById(id);
}

export async function createQuestion(
  question_text: string,
  explanation_text: string
): Promise<Question> {
  return questionsDAL.insertQuestion(question_text, explanation_text);
}

export async function updateQuestion(
  id: number,
  question_text: string,
  explanation_text: string
): Promise<Question | null> {
  return questionsDAL.updateQuestion(id, question_text, explanation_text);
}

export async function removeQuestion(id: number): Promise<boolean> {
  return questionsDAL.deleteQuestion(id);
}

export async function addChoice(
  question_id: number,
  choice_text: string,
  is_correct: boolean
): Promise<Choice> {
  return choicesDAL.insertChoice(question_id, choice_text, is_correct);
}

export async function removeChoicesByQuestionId(question_id: number): Promise<void> {
  return choicesDAL.deleteChoicesByQuestionId(question_id);
}

export async function fetchChoicesByQuestionIds(ids: number[]): Promise<Choice[]> {
  return questionsDAL.getChoicesByQuestionIds(ids);
}
