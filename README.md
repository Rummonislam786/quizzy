# Quizzy 🧠

A production-ready full-stack quiz application built with a strict monorepo architecture.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Ant Design
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL (raw SQL via `pg`, no ORM)
- **Monorepo**: npm workspaces

---

## Project Structure

```
quizzy/
├── apps/
│   ├── api/                    # Express API
│   │   └── src/
│   │       ├── controllers/    # HTTP layer only
│   │       ├── services/       # Business logic
│   │       ├── repositories/   # Data coordination
│   │       ├── middlewares/    # Error handling, validation
│   │       └── routes/         # Route definitions
│   └── web/                    # React + Vite frontend
│       └── src/
│           ├── pages/          # Home, Quiz, Results, Leaderboard, Admin
│           ├── components/     # Layout
│           ├── services/       # API calls
│           └── styles/         # Global CSS
└── packages/
    ├── dal/                    # Data Access Layer (pure SQL)
    │   └── src/
    │       ├── pool.ts         # pg Pool
    │       ├── questions.ts    # Question queries
    │       ├── choices.ts      # Choice queries
    │       ├── sessions.ts     # Session queries
    │       ├── highscores.ts   # Highscore queries
    │       ├── migrate.ts      # Schema migration
    │       └── seed.ts         # Sample data
    ├── types/                  # Shared TypeScript types
    └── utils/                  # Shared utilities
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

---

## Setup & Run

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd quizzy
npm install
```

### 2. Set up the database

Create a PostgreSQL database:

```sql
CREATE DATABASE quizzy;
```

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quizzy
DB_USER=postgres
DB_PASSWORD=your_password
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Also create `packages/dal/.env` with the same DB settings (used by migrate/seed scripts):

```bash
cp apps/api/.env.example packages/dal/.env
```

### 4. Run database migrations

```bash
npm run db:migrate
```

### 5. Seed sample data (optional but recommended)

```bash
npm run db:seed
```

This inserts 15 sample questions and 5 highscores.

### 6. Start the development servers

```bash
npm run dev
```

This starts both:
- **API**: http://localhost:4000
- **Frontend**: http://localhost:5173

---

## API Reference

### Quiz

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quiz/start?limit=10` | Start a new quiz session |
| POST | `/quiz/submit` | Submit answers, get results |

**GET /quiz/start** — Returns session_id + public questions (no answers leaked):
```json
{
  "session_id": "uuid",
  "questions": [
    {
      "id": 1,
      "question_text": "...",
      "choices": [{ "id": 1, "choice_text": "..." }]
    }
  ]
}
```

**POST /quiz/submit** — Evaluates answers server-side:
```json
{
  "session_id": "uuid",
  "answers": [
    { "question_id": 1, "choice_id": 3 }
  ]
}
```

Returns score + per-question results. Explanation text is ONLY included for incorrect answers.

### Highscores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/highscores` | Get top 10 scores |
| POST | `/highscores` | Submit a score |

### Questions (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/questions?search=&limit=10&offset=0` | Paginated question list |
| POST | `/questions` | Create question with choices |
| PUT | `/questions/:id` | Update question |
| DELETE | `/questions/:id` | Delete question |

---

## Architecture Notes

### Strict Layering

```
Frontend → Controller → Service → Repository → DAL → PostgreSQL
```

- **Controllers** only handle HTTP (parse request, call service, send response)
- **Services** contain all business logic (validation, scoring, security)
- **Repositories** coordinate between DAL functions
- **DAL** contains only pure SQL query functions — no business logic

### Security: Secure Quiz Flow

The quiz is designed so correct answers are **never sent to the client** during the quiz:

- `GET /quiz/start` returns questions with `choice_text` but NOT `is_correct`
- `GET /quiz/start` returns questions but NOT `explanation_text`
- `POST /quiz/submit` evaluates answers **entirely server-side**
- `explanation_text` is only returned for **incorrect** answers

### Random Question Selection

Questions are selected using `ORDER BY random() LIMIT n` which is appropriate for tables under ~100k rows. For larger datasets, replace with a reservoir sampling or TABLESAMPLE strategy in `packages/dal/src/questions.ts`.

### Scoring Tie-breaker

Leaderboard sorts by:
1. `score_correct DESC` — more correct answers wins
2. `score_total ASC` — fewer total attempts breaks ties (answered fewer = more efficient)

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home — configure and start a quiz |
| `/quiz` | Active quiz with progress tracking |
| `/results` | Per-question results with explanations, save to leaderboard |
| `/leaderboard` | Top 10 arcade-style leaderboard |
| `/admin` | Question CRUD with search and pagination |
