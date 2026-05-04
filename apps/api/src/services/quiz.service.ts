import { AppError } from '../middlewares/error.middleware';
import * as quizRepo from '../repositories/quiz.repository';
import type {
  QuizStartResponse,
  QuizSubmitRequest,
  QuizSubmitResponse,
  QuestionPublic,
  QuestionResult,
  Choice,
  Question,
} from '@quizzy/types';

const MAX_QUESTIONS = 20;
const MIN_QUESTIONS = 1;

export async function startQuiz(limit: number): Promise<QuizStartResponse> {
  const safeLimit = Math.min(Math.max(limit, MIN_QUESTIONS), MAX_QUESTIONS);

  const questionIds = await quizRepo.fetchRandomQuestionIds(safeLimit);

  if (questionIds.length === 0) {
    throw new AppError(404, 'No questions available. Please add questions first.');
  }

  const [questions, choices, session] = await Promise.all([
    quizRepo.fetchQuestionsByIds(questionIds),
    quizRepo.fetchChoicesByQuestionIds(questionIds),
    quizRepo.createSession(),
  ]);

  await quizRepo.storeSessionQuestions(session.id, questionIds);

  // Build public questions — strip is_correct and explanation_text
  const choicesByQuestion = groupChoicesByQuestion(choices);

  const publicQuestions: QuestionPublic[] = questions.map((q) => ({
    id: q.id,
    question_text: q.question_text,
    choices: (choicesByQuestion[q.id] ?? []).map((c) => ({
      id: c.id,
      choice_text: c.choice_text,
    })),
  }));

  return {
    session_id: session.id,
    questions: publicQuestions,
  };
}

export async function submitQuiz(body: QuizSubmitRequest): Promise<QuizSubmitResponse> {
  const { session_id, answers } = body;

  if (!session_id || !Array.isArray(answers)) {
    throw new AppError(400, 'session_id and answers array are required');
  }

  const sessionExists = await quizRepo.checkSessionExists(session_id);
  if (!sessionExists) {
    throw new AppError(404, 'Session not found');
  }

  const sessionQuestionIds = await quizRepo.getSessionQuestionIds(session_id);

  if (sessionQuestionIds.length === 0) {
    throw new AppError(400, 'Session has no questions');
  }

  // Validate all submitted answers belong to this session
  const answeredQuestionIds = answers.map((a) => a.question_id);
  const unauthorized = answeredQuestionIds.filter(
    (id) => !sessionQuestionIds.includes(id)
  );

  if (unauthorized.length > 0) {
    throw new AppError(400, 'Answers contain questions not in this session');
  }

  // Fetch questions and choices server-side (truth is always server-side)
  const [questions, choices] = await Promise.all([
    quizRepo.fetchQuestionsByIds(sessionQuestionIds),
    quizRepo.fetchChoicesByQuestionIds(sessionQuestionIds),
  ]);

  const choicesByQuestion = groupChoicesByQuestion(choices);
  const questionMap = new Map<number, Question>(questions.map((q) => [q.id, q]));
  const answerMap = new Map<number, number>(answers.map((a) => [a.question_id, a.choice_id]));

  let scoreCorrect = 0;

  const results: QuestionResult[] = sessionQuestionIds.map((qId) => {
    const question = questionMap.get(qId)!;
    const qChoices = choicesByQuestion[qId] ?? [];
    const correctChoice = qChoices.find((c) => c.is_correct);
    const selectedChoiceId = answerMap.get(qId) ?? -1;
    const isCorrect = correctChoice?.id === selectedChoiceId;

    if (isCorrect) scoreCorrect++;

    return {
      question_id: qId,
      question_text: question.question_text,
      is_correct: isCorrect,
      selected_choice_id: selectedChoiceId,
      correct_choice_id: correctChoice?.id ?? -1,
      // Only expose explanation for wrong answers
      ...(isCorrect ? {} : { explanation_text: question.explanation_text }),
      choices: qChoices,
    };
  });

  return {
    score_correct: scoreCorrect,
    score_total: sessionQuestionIds.length,
    results,
  };
}

function groupChoicesByQuestion(choices: Choice[]): Record<number, Choice[]> {
  return choices.reduce<Record<number, Choice[]>>((acc, c) => {
    if (!acc[c.question_id]) acc[c.question_id] = [];
    acc[c.question_id].push(c);
    return acc;
  }, {});
}
