import { Router } from 'express';
import { startQuiz, submitQuiz } from '../controllers/quiz.controller';

export const quizRoutes = Router();

// GET /quiz/start?limit=10
quizRoutes.get('/start', startQuiz);

// POST /quiz/submit
quizRoutes.post('/submit', submitQuiz);
