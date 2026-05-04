import { useEffect, useState } from "react";
import { Spin, Alert, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getHighscores } from "../services/api";
import type { Highscore } from "@quizzy/types";
import styles from "./LeaderboardPage.module.css";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [scores, setScores] = useState<Highscore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getHighscores()
      .then(setScores)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.center}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.center}>
        <Alert message="Error" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>LEADERBOARD</h1>
        <p className={styles.subtitle}>Top 10 all-time scores</p>
      </div>

      {scores.length === 0 ? (
        <div className={styles.empty}>
          <p>No scores yet. Be the first!</p>
          <Button type="primary" onClick={() => navigate("/")}>
            Start Quiz
          </Button>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span className={styles.colRank}>Rank</span>
            <span className={styles.colName}>Player</span>
            <span className={styles.colScore}>Score</span>
            <span className={styles.colPct}>Accuracy</span>
            <span className={styles.colDate}>Date</span>
          </div>

          {scores.map((score, idx) => {
            const pct = Math.round(
              (score.score_correct / score.score_total) * 100,
            );
            const isTop = idx < 3;
            return (
              <div
                key={score.id}
                className={`${styles.row} ${isTop ? styles.topRow : ""} ${idx === 0 ? styles.first : ""}`}
              >
                <span className={styles.colRank}>
                  {MEDALS[idx] ?? (
                    <span className={styles.rankNum}>{idx + 1}</span>
                  )}
                </span>
                <div className={styles.colName}>
                  <span className={styles.playerName}>{score.player_name}</span>
                  <span className={styles.colDate}>
                    {new Date(score.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className={styles.colScore}>
                  <span className={styles.correct}>{score.score_correct}</span>
                  <span className={styles.slash}>/</span>
                  <span className={styles.total}>{score.score_total}</span>
                </span>
                <span className={styles.colPct}>
                  <span
                    className={styles.pctBar}
                    style={{ "--w": `${pct}%` } as React.CSSProperties}
                  >
                    <span className={styles.pctLabel}>{pct}%</span>
                  </span>
                </span>
                <span className={styles.colDate}>
                  {new Date(score.created_at).toLocaleDateString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.actions}>
        <Button size="large" type="primary" onClick={() => navigate("/")}>
          Play Again
        </Button>
      </div>
    </div>
  );
}
