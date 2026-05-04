import type {
  QuizStartResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  Highscore,
  CreateHighscoreRequest,
  Question,
  PaginatedResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '@quizzy/types';

const BASE_URL = '/api';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// Quiz
export const startQuiz = (limit = 10): Promise<QuizStartResponse> =>
  request(`/quiz/start?limit=${limit}`);

export const submitQuiz = (body: QuizSubmitRequest): Promise<QuizSubmitResponse> =>
  request('/quiz/submit', { method: 'POST', body: JSON.stringify(body) });

// Highscores
export const getHighscores = (): Promise<Highscore[]> =>
  request('/highscores');

export const postHighscore = (body: CreateHighscoreRequest): Promise<Highscore> =>
  request('/highscores', { method: 'POST', body: JSON.stringify(body) });

// Questions (admin)
export const getQuestions = (
  params: { search?: string; limit?: number; offset?: number }
): Promise<PaginatedResponse<Question & { choices: Question['choices'] }>> => {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.limit !== undefined) qs.set('limit', String(params.limit));
  if (params.offset !== undefined) qs.set('offset', String(params.offset));
  return request(`/questions?${qs.toString()}`);
};

export const createQuestion = (body: CreateQuestionRequest): Promise<Question> =>
  request('/questions', { method: 'POST', body: JSON.stringify(body) });

export const updateQuestion = (id: number, body: UpdateQuestionRequest): Promise<Question> =>
  request(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const deleteQuestion = (id: number): Promise<void> =>
  request(`/questions/${id}`, { method: 'DELETE' });
