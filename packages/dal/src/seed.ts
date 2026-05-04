import pool from './pool';

const questions = [
  {
    question_text: 'What does HTML stand for?',
    explanation_text: 'HTML stands for HyperText Markup Language, the standard language for creating web pages.',
    choices: [
      { text: 'HyperText Markup Language', correct: true },
      { text: 'HighText Machine Language', correct: false },
      { text: 'HyperText and links Markup Language', correct: false },
      { text: 'Home Tool Markup Language', correct: false },
    ],
  },
  {
    question_text: 'Which keyword is used to declare a variable in JavaScript that cannot be reassigned?',
    explanation_text: '`const` declares a block-scoped variable whose binding cannot be reassigned, though the value may be mutated if it is an object.',
    choices: [
      { text: 'var', correct: false },
      { text: 'let', correct: false },
      { text: 'const', correct: true },
      { text: 'fixed', correct: false },
    ],
  },
  {
    question_text: 'What is the time complexity of binary search?',
    explanation_text: 'Binary search halves the search space on each step, yielding O(log n) time complexity.',
    choices: [
      { text: 'O(n)', correct: false },
      { text: 'O(log n)', correct: true },
      { text: 'O(n²)', correct: false },
      { text: 'O(1)', correct: false },
    ],
  },
  {
    question_text: 'Which HTTP method is idempotent but NOT safe?',
    explanation_text: 'PUT is idempotent (multiple identical requests have the same effect as one) but not safe because it modifies the resource.',
    choices: [
      { text: 'GET', correct: false },
      { text: 'POST', correct: false },
      { text: 'PUT', correct: true },
      { text: 'HEAD', correct: false },
    ],
  },
  {
    question_text: 'In CSS, what does the `z-index` property control?',
    explanation_text: 'z-index controls the stacking order of positioned elements along the z-axis (depth). Higher values appear in front.',
    choices: [
      { text: 'Zoom level of an element', correct: false },
      { text: 'Horizontal position', correct: false },
      { text: 'Stack order (depth) of elements', correct: true },
      { text: 'Size of an element', correct: false },
    ],
  },
  {
    question_text: 'What is a PostgreSQL "index"?',
    explanation_text: 'An index is a data structure that improves the speed of data retrieval at the cost of additional storage and write overhead.',
    choices: [
      { text: 'A backup copy of a table', correct: false },
      { text: 'A data structure that speeds up queries', correct: true },
      { text: 'A constraint that enforces uniqueness', correct: false },
      { text: 'A stored procedure', correct: false },
    ],
  },
  {
    question_text: 'What does the React hook `useEffect` primarily do?',
    explanation_text: 'useEffect lets you synchronize a component with an external system or perform side effects after render.',
    choices: [
      { text: 'Manages local component state', correct: false },
      { text: 'Memoizes expensive computations', correct: false },
      { text: 'Handles side effects and lifecycle events', correct: true },
      { text: 'Creates a context value', correct: false },
    ],
  },
  {
    question_text: 'Which of the following is NOT a valid HTTP status code category?',
    explanation_text: 'HTTP status codes range from 1xx–5xx. 6xx is not a valid category.',
    choices: [
      { text: '2xx (Success)', correct: false },
      { text: '4xx (Client Error)', correct: false },
      { text: '6xx (Extended)', correct: true },
      { text: '5xx (Server Error)', correct: false },
    ],
  },
  {
    question_text: 'In TypeScript, what is a "union type"?',
    explanation_text: 'A union type (A | B) allows a variable to hold a value of one of several specified types.',
    choices: [
      { text: 'A type that merges two interfaces', correct: false },
      { text: 'A type that can be one of several types', correct: true },
      { text: 'A generic type constraint', correct: false },
      { text: 'An inherited class type', correct: false },
    ],
  },
  {
    question_text: 'What is the purpose of a JWT (JSON Web Token)?',
    explanation_text: 'JWTs are a compact, URL-safe means of representing claims between two parties, commonly used for stateless authentication.',
    choices: [
      { text: 'To encrypt database passwords', correct: false },
      { text: 'To compress JSON payloads', correct: false },
      { text: 'To represent authentication claims between parties', correct: true },
      { text: 'To format API responses', correct: false },
    ],
  },
  {
    question_text: 'What does "ACID" stand for in database transactions?',
    explanation_text: 'ACID stands for Atomicity, Consistency, Isolation, and Durability — properties that guarantee reliable database transactions.',
    choices: [
      { text: 'Async, Concurrent, Indexed, Durable', correct: false },
      { text: 'Atomicity, Consistency, Isolation, Durability', correct: true },
      { text: 'Atomic, Cached, Immutable, Distributed', correct: false },
      { text: 'Accessible, Consistent, Integrated, Durable', correct: false },
    ],
  },
  {
    question_text: 'Which data structure operates on a LIFO (Last In, First Out) principle?',
    explanation_text: 'A stack operates on LIFO: the last element pushed is the first to be popped.',
    choices: [
      { text: 'Queue', correct: false },
      { text: 'Linked List', correct: false },
      { text: 'Stack', correct: true },
      { text: 'Heap', correct: false },
    ],
  },
  {
    question_text: 'What is the default `display` value of a `<div>` element?',
    explanation_text: 'div is a block-level element, so its default display value is `block`.',
    choices: [
      { text: 'inline', correct: false },
      { text: 'flex', correct: false },
      { text: 'block', correct: true },
      { text: 'inline-block', correct: false },
    ],
  },
  {
    question_text: 'In Node.js, what does the `EventEmitter` class enable?',
    explanation_text: 'EventEmitter implements the observer pattern, allowing objects to emit named events and register listener callbacks.',
    choices: [
      { text: 'File system access', correct: false },
      { text: 'HTTP request handling', correct: false },
      { text: 'Observer pattern with named events', correct: true },
      { text: 'Database connection pooling', correct: false },
    ],
  },
  {
    question_text: 'What is a "race condition" in concurrent programming?',
    explanation_text: 'A race condition occurs when a program\'s outcome depends on the non-deterministic timing of concurrent operations.',
    choices: [
      { text: 'When two threads complete at the same time', correct: false },
      { text: 'When the outcome depends on the timing of concurrent operations', correct: true },
      { text: 'A deadlock between two processes', correct: false },
      { text: 'When a thread exceeds its time slice', correct: false },
    ],
  },
];

async function seed() {
  console.log('Seeding database...');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE highscores, quiz_session_questions, quiz_sessions, choices, questions RESTART IDENTITY CASCADE');

    for (const q of questions) {
      const qResult = await client.query<{ id: number }>(
        `INSERT INTO questions (question_text, explanation_text) VALUES ($1, $2) RETURNING id`,
        [q.question_text, q.explanation_text]
      );
      const questionId = qResult.rows[0].id;

      for (const c of q.choices) {
        await client.query(
          `INSERT INTO choices (question_id, choice_text, is_correct) VALUES ($1, $2, $3)`,
          [questionId, c.text, c.correct]
        );
      }
    }

    // Seed some highscores
    const scores = [
      { name: 'QuizMaster', correct: 15, total: 15 },
      { name: 'CodeNinja', correct: 13, total: 15 },
      { name: 'ByteWizard', correct: 12, total: 15 },
      { name: 'DevHero', correct: 12, total: 15 },
      { name: 'Rummon', correct: 10, total: 10 },
    ];

    for (const s of scores) {
      await client.query(
        `INSERT INTO highscores (player_name, score_total, score_correct) VALUES ($1, $2, $3)`,
        [s.name, s.total, s.correct]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${questions.length} questions and ${scores.length} highscores`);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
