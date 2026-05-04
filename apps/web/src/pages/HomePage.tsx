import { useNavigate } from "react-router-dom";
import { Button, Select } from "antd";
import { useState } from "react";
import styles from "./HomePage.module.css";

const QUESTION_OPTIONS = [5, 10, 15, 20];

export default function HomePage() {
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(10);

  return (
    <div className={styles.root}>
      <div className={styles.hero}>
        <h1 className={styles.title}>QUIZZY</h1>
        <p className={styles.subtitle}>
          Test your knowledge. Climb the leaderboard.
          <br />
          Prove you're the smartest in the room.
        </p>

        <div className={styles.controls}>
          <div className={styles.control}>
            <label className={styles.label}>Questions</label>
            <Select
              value={questionCount}
              onChange={setQuestionCount}
              options={QUESTION_OPTIONS.map((n) => ({
                value: n,
                label: `${n} Questions`,
              }))}
              className={styles.selectInput}
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            className={styles.startBtn}
            onClick={() => navigate(`/quiz?limit=${questionCount}`)}
          >
            Start Quiz
          </Button>
        </div>

        <div className={styles.meta}>
          <div className={styles.metaItem}>
            <span className={styles.metaNum}>∞</span>
            <span className={styles.metaLabel}>Questions</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaNum}>10</span>
            <span className={styles.metaLabel}>Top Scores</span>
          </div>
          <div className={styles.metaDivider} />
          <div className={styles.metaItem}>
            <span className={styles.metaNum}>0ms</span>
            <span className={styles.metaLabel}>Load Time</span>
          </div>
        </div>
      </div>
    </div>
  );
}
