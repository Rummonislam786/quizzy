import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Progress, Spin, Alert, Radio } from 'antd';
import { startQuiz, submitQuiz } from '../services/api';
import type { QuizStartResponse, UserAnswer } from '@quizzy/types';
import styles from './QuizPage.module.css';

type QuizState = 'loading' | 'active' | 'submitting' | 'error';

export default function QuizPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const limit = parseInt(searchParams.get('limit') ?? '10', 10);

  const [state, setState] = useState<QuizState>('loading');
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState<QuizStartResponse | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    startQuiz(limit)
      .then((data) => {
        if (!cancelled) {
          setQuiz(data);
          setState('active');
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setState('error');
        }
      });
    return () => { cancelled = true; };
  }, [limit]);

  const currentQuestion = quiz?.questions[currentIndex];
  const totalQuestions = quiz?.questions.length ?? 0;
  const selectedChoice = currentQuestion ? answers.get(currentQuestion.id) : undefined;
  const progress = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  const handleSelect = useCallback((questionId: number, choiceId: number) => {
    setAnswers((prev) => new Map(prev).set(questionId, choiceId));
  }, []);

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setState('submitting');
    try {
      const userAnswers: UserAnswer[] = quiz.questions.map((q) => ({
        question_id: q.id,
        choice_id: answers.get(q.id) ?? -1,
      }));

      const result = await submitQuiz({
        session_id: quiz.session_id,
        answers: userAnswers,
      });

      navigate('/results', { state: { result } });
    } catch (err) {
      setError((err as Error).message);
      setState('error');
    }
  };

  const answeredCount = answers.size;
  const isLast = currentIndex === totalQuestions - 1;
  const allAnswered = answeredCount === totalQuestions;

  if (state === 'loading') {
    return (
      <div className={styles.center}>
        <Spin size="large" />
        <p className={styles.loadingText}>Loading quiz...</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className={styles.center}>
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/')}>Go Home</Button>
          }
        />
      </div>
    );
  }

  if (!currentQuestion || !quiz) return null;

  return (
    <div className={styles.root}>
      <div className={styles.topBar}>
        <div className={styles.questionCounter}>
          <span className={styles.qNum}>{currentIndex + 1}</span>
          <span className={styles.qTotal}>/ {totalQuestions}</span>
        </div>
        <div className={styles.progressWrap}>
          <Progress
            percent={progress}
            showInfo={false}
            strokeColor="var(--color-accent)"
            trailColor="var(--color-border)"
          />
        </div>
        <div className={styles.answeredBadge}>
          {answeredCount}/{totalQuestions} answered
        </div>
      </div>

      <div className={styles.questionCard}>
        <p className={styles.questionText}>{currentQuestion.question_text}</p>

        <Radio.Group
          className={styles.choices}
          value={selectedChoice}
          onChange={(e) => handleSelect(currentQuestion.id, e.target.value)}
        >
          {currentQuestion.choices.map((choice) => (
            <Radio.Button
              key={choice.id}
              value={choice.id}
              className={`${styles.choice} ${selectedChoice === choice.id ? styles.selected : ''}`}
            >
              {choice.choice_text}
            </Radio.Button>
          ))}
        </Radio.Group>
      </div>

      <div className={styles.nav}>
        <Button onClick={handlePrev} disabled={currentIndex === 0} size="large">
          ← Previous
        </Button>

        {!isLast ? (
          <Button
            type="primary"
            onClick={handleNext}
            disabled={!selectedChoice}
            size="large"
          >
            Next →
          </Button>
        ) : (
          <Button
            type="primary"
            onClick={handleSubmit}
            disabled={!allAnswered}
            loading={state === 'submitting'}
            size="large"
            className={styles.submitBtn}
          >
            Submit Quiz
          </Button>
        )}
      </div>

      {isLast && !allAnswered && (
        <p className={styles.unansweredWarning}>
          You have {totalQuestions - answeredCount} unanswered question(s). Answer all to submit.
        </p>
      )}
    </div>
  );
}
