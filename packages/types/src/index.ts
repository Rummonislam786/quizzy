// Question types
export interface Question {
  id: number;
  question_text: string;
  explanation_text: string;
  created_at: string;
  choices: Choice[];
}

export interface QuestionPublic {
  id: number;
  question_text: string;
  choices: ChoicePublic[];
}

export interface Choice {
  id: number;
  question_id: number;
  choice_text: string;
  is_correct: boolean;
}

export interface ChoicePublic {
  id: number;
  choice_text: string;
}

// Quiz session types
export interface QuizSession {
  id: string;
  created_at: string;
}

export interface QuizStartResponse {
  session_id: string;
  questions: QuestionPublic[];
}

export interface UserAnswer {
  question_id: number;
  choice_id: number;
}

export interface QuizSubmitRequest {
  session_id: string;
  answers: UserAnswer[];
}

export interface QuestionResult {
  question_id: number;
  question_text: string;
  is_correct: boolean;
  selected_choice_id: number;
  correct_choice_id: number;
  explanation_text?: string; // only on incorrect
  choices: Choice[];
}

export interface QuizSubmitResponse {
  score_correct: number;
  score_total: number;
  results: QuestionResult[];
}

// Highscore types
export interface Highscore {
  id: number;
  player_name: string;
  score_total: number;
  score_correct: number;
  created_at: string;
}

export interface CreateHighscoreRequest {
  player_name: string;
  score_total: number;
  score_correct: number;
}

// Admin question CRUD types
export interface CreateQuestionRequest {
  question_text: string;
  explanation_text: string;
  choices: CreateChoiceRequest[];
}

export interface CreateChoiceRequest {
  choice_text: string;
  is_correct: boolean;
}

export interface UpdateQuestionRequest {
  question_text?: string;
  explanation_text?: string;
  choices?: CreateChoiceRequest[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// API error
export interface ApiError {
  error: string;
  details?: string;
}
