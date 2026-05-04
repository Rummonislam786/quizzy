import { questionsDAL, choicesDAL, sessionsDAL } from '@quizzy/dal';
import type { Question, Choice, QuizSession } from '@quizzy/types';

export async function fetchRandomQuestionIds(limit: number): Promise<number[]> {
  return questionsDAL.getRandomQuestionIds(limit);
}

export async function fetchQuestionsByIds(ids: number[]): Promise<Question[]> {
  return questionsDAL.getQuestionsByIds(ids);
}

export async function fetchChoicesByQuestionIds(questionIds: number[]): Promise<Choice[]> {
  return questionsDAL.getChoicesByQuestionIds(questionIds);
}

export async function createSession(): Promise<QuizSession> {
  return sessionsDAL.createSession();
}

export async function storeSessionQuestions(sessionId: string, questionIds: number[]): Promise<void> {
  return sessionsDAL.insertSessionQuestions(sessionId, questionIds);
}

export async function getSessionQuestionIds(sessionId: string): Promise<number[]> {
  return sessionsDAL.getSessionQuestionIds(sessionId);
}

export async function checkSessionExists(sessionId: string): Promise<boolean> {
  return sessionsDAL.sessionExists(sessionId);
}

export async function fetchChoiceById(id: number): Promise<ReturnType<typeof choicesDAL.getChoiceById>> {
  return choicesDAL.getChoiceById(id);
}
