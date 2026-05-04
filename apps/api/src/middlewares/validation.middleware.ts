import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';

export function validateBody(
  fields: string[]
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    for (const field of fields) {
      if (req.body[field] === undefined || req.body[field] === null) {
        return next(new AppError(400, `Missing required field: ${field}`));
      }
    }
    next();
  };
}
