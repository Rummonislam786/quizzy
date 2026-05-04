import express from 'express';
import cors from 'cors';
import { quizRoutes } from './routes/quiz.routes';
import { questionRoutes } from './routes/question.routes';
import { highscoreRoutes } from './routes/highscore.routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/quiz', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/highscores', highscoreRoutes);

// Global error handler (must be last)
app.use(errorMiddleware);

export default app;
