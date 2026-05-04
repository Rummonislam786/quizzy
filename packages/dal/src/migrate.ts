import pool from './pool';

const schema = `
-- Enable UUID extension for session IDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  question_text TEXT NOT NULL,
  explanation_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Choices table
CREATE TABLE IF NOT EXISTS choices (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  choice_text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE
);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Quiz session questions junction table
CREATE TABLE IF NOT EXISTS quiz_session_questions (
  session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, question_id)
);

-- Highscores table
CREATE TABLE IF NOT EXISTS highscores (
  id SERIAL PRIMARY KEY,
  player_name VARCHAR(15) NOT NULL,
  score_total INTEGER NOT NULL,
  score_correct INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_choices_question_id ON choices(question_id);
CREATE INDEX IF NOT EXISTS idx_session_questions_session_id ON quiz_session_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_highscores_score ON highscores(score_correct DESC, score_total ASC);
CREATE INDEX IF NOT EXISTS idx_questions_text ON questions USING GIN(to_tsvector('english', question_text));
`;

async function migrate() {
  console.log('Running migrations...');
  try {
    await pool.query(schema);
    console.log('✅ Migration complete');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
