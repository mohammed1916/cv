import styles from './AlgorithmNarrative.module.css';
import { resolveNarrative } from './resolveNarrative';

// Algorithms supply the meaning; this shared view only presents the narrative.
export default function AlgorithmNarrative({ definition, step = null, stepIndex = -1, story, input }) {
  const narrative = resolveNarrative(definition, { step, stepIndex, story, input });
  if (!narrative) return null;
  const { goal, chapters = [], chapter, why, achieved, next, scope, activeLine, strategyLabel = 'Algorithm strategy' } = narrative;
  return (
    <section className={styles.narrative} aria-label="Algorithm story">
      {goal && <p className={styles.goal}><strong>Our goal</strong>{goal}</p>}
      {chapters.length > 0 && <ol className={styles.chapters} aria-label={strategyLabel}>
        {chapters.map((title, index) => (
          <li key={title} aria-current={index === chapter ? 'step' : undefined}>
            <span>{index + 1}</span>{title}
          </li>
        ))}
      </ol>}
      {(scope || activeLine) && <div className={styles.scope}>{scope}{activeLine ? `${scope ? ' · ' : ''}Code line ${activeLine}` : ''}</div>}
      <dl className={styles.details}>
        {why && <div><dt>Why this code exists</dt><dd>{why}</dd></div>}
        {achieved && <div><dt>What we have achieved</dt><dd>{achieved}</dd></div>}
        {next && <div><dt>What comes next</dt><dd>{next}</dd></div>}
      </dl>
    </section>
  );
}
