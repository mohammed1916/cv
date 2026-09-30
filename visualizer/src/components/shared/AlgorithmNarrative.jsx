import styles from './AlgorithmNarrative.module.css';

// Algorithms supply the meaning; this shared view only presents the narrative.
export default function AlgorithmNarrative({ goal, chapters, chapter, why, achieved, next, scope, activeLine }) {
  return (
    <section className={styles.narrative} aria-label="Algorithm story">
      <p className={styles.goal}><strong>Our goal</strong>{goal}</p>
      <ol className={styles.chapters} aria-label="Strategy (repeated for each nested group)">
        {chapters.map((title, index) => (
          <li key={title} aria-current={index === chapter ? 'step' : undefined}>
            <span>{index + 1}</span>{title}
          </li>
        ))}
      </ol>
      <div className={styles.scope}>{scope}{activeLine && ` · Code line ${activeLine}`}</div>
      <dl className={styles.details}>
        <div><dt>Why this code exists</dt><dd>{why}</dd></div>
        <div><dt>What we have achieved</dt><dd>{achieved}</dd></div>
        <div><dt>What comes next</dt><dd>{next}</dd></div>
      </dl>
    </section>
  );
}
