import { Request, Response, NextFunction } from 'express';
import * as questionService from '../services/question.service';
import type { CreateQuestionRequest, UpdateQuestionRequest } from '@quizzy/types';

export async function listQuestions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { search = '', limit, offset } = req.query;
    const result = await questionService.listQuestions(
      String(search),
      limit,
      offset
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function createQuestion(
  req: Request<object, object, CreateQuestionRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const question = await questionService.createQuestion(req.body);
    res.status(201).json(question);
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(
  req: Request<{ id: string }, object, UpdateQuestionRequest>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid question ID' });
      return;
    }
    const question = await questionService.updateQuestion(id, req.body);
    res.json(question);
  } catch (err) {
    next(err);
  }
}

export async function deleteQuestion(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid question ID' });
      return;
    }
    await questionService.deleteQuestion(id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
