import styles from './SearchStructures.module.css';

export default function SearchWindow({ nums, step, exclusive = false, target }) {
  const left = step?.left ?? 0, right = step?.right ?? (exclusive ? nums.length : nums.length - 1);
  const found = step?.foundIndex ?? (step?.phase === 'done' ? step.result : undefined);
  return <figure className={styles.search}>
    <figcaption>Search interval {exclusive ? `[${left}, ${right})` : `[${left}, ${right}]`}{target !== undefined ? ` · target ${target}` : ''}</figcaption>
    <div className={styles.cells}>{nums.map((value, i) => {
      const outside = i < left || (exclusive ? i >= right : i > right);
      const roles = [i === left ? 'L' : '', i === step?.mid ? 'M' : '', i === right ? 'R' : ''].filter(Boolean);
      return <div key={i} className={styles.cell} data-outside={outside} data-active={i === step?.mid} data-found={found === i}>
        <small>[{i}]</small><strong>{value}</strong><span>{roles.join(' · ') || (outside ? 'excluded' : 'candidate')}</span>
      </div>;
    })}{exclusive && <div className={styles.cell} data-found={found === nums.length}><small>[{nums.length}]</small><strong>∅</strong><span>{right === nums.length ? 'R · end' : 'end'}</span></div>}</div>
    {!nums.length && <p>Empty array</p>}
    <p>L = left · M = midpoint · R = {exclusive ? 'excluded right boundary' : 'inclusive right boundary'}. Candidates remaining: {Math.max(0, right - left + (exclusive ? 0 : 1))}.</p>
  </figure>;
}
