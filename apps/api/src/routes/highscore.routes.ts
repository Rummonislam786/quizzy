import { Router } from 'express';
import { getHighscores, createHighscore } from '../controllers/highscore.controller';

export const highscoreRoutes = Router();

// GET /highscores
highscoreRoutes.get('/', getHighscores);

// POST /highscores
highscoreRoutes.post('/', createHighscore);
