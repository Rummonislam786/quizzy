import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Input, message } from 'antd';
import { useState } from 'react';
import { postHighscore } from '../services/api';
import type { QuizSubmitResponse } from '@quizzy/types';
import styles from './ResultsPage.module.css';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as QuizSubmitResponse | undefined;

  const [playerName, setPlayerName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!result) {
    return (
      <div className={styles.center}>
        <p>No quiz results found.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const percentage = Math.round((result.score_correct / result.score_total) * 100);

  const handleSaveScore = async () => {
    if (!playerName.trim()) {
      message.error('Please enter your name');
      return;
    }
    if (playerName.trim().length > 15) {
      message.error('Name must be 15 characters or fewer');
      return;
    }
    setSaving(true);
    try {
      await postHighscore({
        player_name: playerName.trim(),
        score_total: result.score_total,
        score_correct: result.score_correct,
      });
      setSaved(true);
      message.success('Score saved to leaderboard!');
    } catch (err) {
      message.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.scoreHeader}>
        <div className={styles.scoreCircle} style={{ '--pct': `${percentage}%` } as React.CSSProperties}>
          <span className={styles.scoreNum}>{result.score_correct}</span>
          <span className={styles.scoreOf}>/ {result.score_total}</span>
        </div>
        <div className={styles.scoreInfo}>
          <h1 className={styles.title}>
            {percentage >= 80 ? '🏆 Excellent!' : percentage >= 50 ? '👍 Good effort' : '💪 Keep practicing'}
          </h1>
          <p className={styles.pct}>{percentage}% correct</p>
        </div>
      </div>

      {!saved && (
        <div className={styles.saveScore}>
          <p className={styles.saveLabel}>Save your score to the leaderboard</p>
          <div className={styles.saveRow}>
            <Input
              placeholder="Your name (max 15 chars)"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 15))}
              maxLength={15}
              style={{ maxWidth: 260 }}
              size="large"
              onPressEnter={handleSaveScore}
            />
            <Button
              type="primary"
              onClick={handleSaveScore}
              loading={saving}
              size="large"
            >
              Save Score
            </Button>
          </div>
        </div>
      )}

      {saved && (
        <div className={styles.savedMsg}>
          ✅ Score saved! <button className={styles.link} onClick={() => navigate('/leaderboard')}>View Leaderboard →</button>
        </div>
      )}

      <div className={styles.results}>
        <h2 className={styles.resultsTitle}>Review</h2>
        {result.results.map((r, idx) => (
          <div
            key={r.question_id}
            className={`${styles.resultCard} ${r.is_correct ? styles.correct : styles.incorrect}`}
          >
            <div className={styles.resultHeader}>
              <span className={styles.qIndex}>Q{idx + 1}</span>
              <span className={styles.resultBadge}>
                {r.is_correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <p className={styles.qText}>{r.question_text}</p>

            <div className={styles.choiceList}>
              {r.choices.map((c) => {
                const isSelected = c.id === r.selected_choice_id;
                const isCorrect = c.id === r.correct_choice_id;
                let cls = styles.choiceItem;
                if (isCorrect) cls += ` ${styles.correctChoice}`;
                if (isSelected && !isCorrect) cls += ` ${styles.wrongChoice}`;
                return (
                  <div key={c.id} className={cls}>
                    {isCorrect && <span>✓ </span>}
                    {isSelected && !isCorrect && <span>✗ </span>}
                    {c.choice_text}
                  </div>
                );
              })}
            </div>

            {!r.is_correct && r.explanation_text && (
              <div className={styles.explanation}>
                <span className={styles.explanationLabel}>Explanation: </span>
                {r.explanation_text}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <Button size="large" onClick={() => navigate('/')}>Play Again</Button>
        <Button size="large" type="primary" onClick={() => navigate('/leaderboard')}>Leaderboard</Button>
      </div>
    </div>
  );
}
