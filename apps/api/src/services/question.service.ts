import { AppError } from '../middlewares/error.middleware';
import * as questionRepo from '../repositories/question.repository';
import type {
  Question,
  PaginatedResponse,
  CreateQuestionRequest,
  UpdateQuestionRequest,
} from '@quizzy/types';
import { parseIntSafe } from '@quizzy/utils';

export async function listQuestions(
  search: string,
  limitRaw: unknown,
  offsetRaw: unknown
): Promise<PaginatedResponse<Question & { choices: Question['choices'] }>> {
  const limit = Math.min(Math.max(parseIntSafe(limitRaw, 10), 1), 100);
  const offset = Math.max(parseIntSafe(offsetRaw, 0), 0);

  const { rows, total } = await questionRepo.fetchQuestionsWithPagination(
    search ?? '',
    limit,
    offset
  );

  const questionIds = rows.map((q) => q.id);
  const choices = questionIds.length
    ? await questionRepo.fetchChoicesByQuestionIds(questionIds)
    : [];

  const choicesByQuestion = choices.reduce<Record<number, typeof choices>>(
    (acc, c) => {
      if (!acc[c.question_id]) acc[c.question_id] = [];
      acc[c.question_id].push(c);
      return acc;
    },
    {}
  );

  const data = rows.map((q) => ({
    ...q,
    choices: choicesByQuestion[q.id] ?? [],
  }));

  return { data, total, limit, offset };
}

export async function createQuestion(body: CreateQuestionRequest): Promise<Question & { choices: Question['choices'] }> {
  if (!body.question_text?.trim()) {
    throw new AppError(400, 'question_text is required');
  }
  if (!body.explanation_text?.trim()) {
    throw new AppError(400, 'explanation_text is required');
  }
  if (!Array.isArray(body.choices) || body.choices.length < 2) {
    throw new AppError(400, 'At least 2 choices are required');
  }

  const correctCount = body.choices.filter((c) => c.is_correct).length;
  if (correctCount !== 1) {
    throw new AppError(400, 'Exactly one choice must be marked as correct');
  }

  const question = await questionRepo.createQuestion(
    body.question_text.trim(),
    body.explanation_text.trim()
  );

  const choices = await Promise.all(
    body.choices.map((c) =>
      questionRepo.addChoice(question.id, c.choice_text.trim(), c.is_correct)
    )
  );

  return { ...question, choices };
}

export async function updateQuestion(
  id: number,
  body: UpdateQuestionRequest
): Promise<Question & { choices: Question['choices'] }> {
  const existing = await questionRepo.fetchQuestionById(id);
  if (!existing) throw new AppError(404, 'Question not found');

  const question_text = body.question_text?.trim() ?? existing.question_text;
  const explanation_text = body.explanation_text?.trim() ?? existing.explanation_text;

  const updated = await questionRepo.updateQuestion(id, question_text, explanation_text);
  if (!updated) throw new AppError(404, 'Question not found');

  let choices;
  if (body.choices && body.choices.length >= 2) {
    const correctCount = body.choices.filter((c) => c.is_correct).length;
    if (correctCount !== 1) {
      throw new AppError(400, 'Exactly one choice must be marked as correct');
    }

    await questionRepo.removeChoicesByQuestionId(id);
    choices = await Promise.all(
      body.choices.map((c) =>
        questionRepo.addChoice(id, c.choice_text.trim(), c.is_correct)
      )
    );
  } else {
    choices = await questionRepo.fetchChoicesByQuestionIds([id]);
  }

  return { ...updated, choices };
}

export async function deleteQuestion(id: number): Promise<void> {
  const deleted = await questionRepo.removeQuestion(id);
  if (!deleted) throw new AppError(404, 'Question not found');
}
