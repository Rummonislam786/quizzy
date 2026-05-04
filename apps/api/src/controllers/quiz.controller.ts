import { Request, Response, NextFunction } from 'express';
import * as quizService from '../services/quiz.service';
import { parseIntSafe } from '@quizzy/utils';
import type { QuizSubmitRequest } from '@quizzy/types';

export async function startQuiz(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = parseIntSafe(req.query.limit, 10);
    const result = await quizService.startQuiz(limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(
  req: Request<object, object, QuizSubmitRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await quizService.submitQuiz(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
