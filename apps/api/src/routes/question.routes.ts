import { Router } from 'express';
import {
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/question.controller';

export const questionRoutes = Router();

// GET /questions?search=&limit=&offset=
questionRoutes.get('/', listQuestions);

// POST /questions
questionRoutes.post('/', createQuestion);

// PUT /questions/:id
questionRoutes.put('/:id', updateQuestion);

// DELETE /questions/:id
questionRoutes.delete('/:id', deleteQuestion);
