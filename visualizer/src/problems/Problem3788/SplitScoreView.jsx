import './SplitScoreView.css'

const show = value => (value === null || value === undefined ? '-' : String(value))

// Renders one frame: the nums row with the split boundary, the suffix-minimum row filled right to left,
// the current candidate calculation, and the retained optimum that survives to completion.
export default function SplitScoreView({ run, step }) {
  const nums = run.input.nums
  const n = nums.length
  const k = step.split
  const hasSplit = k >= 0
  const candidateSource = hasSplit ? step.sufSrc[k + 1] : null

  const cells = []
  for (let i = 0; i < n; i++) {
    const role = hasSplit ? (i <= k ? 'prefix' : 'suffix') : 'unsplit'
    cells.push(<div key={`n${i}`} className={`split-cell ${i === step.at ? 'is-current' : ''}`} data-role={role}>
      <small>[{i}]</small><strong>{nums[i]}</strong><span>{role}</span>
    </div>)
    if (hasSplit && i === k) {
      cells.push(<div key="boundary" className="split-boundary" role="separator" aria-label={`split boundary after index ${k}`}>
        <span>split after {k}</span>
      </div>)
    }
  }

  const sufCells = []
  for (let i = 0; i < n; i++) {
    const filled = step.sufVal[i] !== null
    const isCandidate = hasSplit && i === k + 1
    sufCells.push(<div key={`s${i}`} className={`split-cell ${i === step.at ? 'is-current' : ''} ${isCandidate ? 'is-candidate' : ''}`} data-filled={filled ? 'yes' : 'no'}>
      <small>[{i}]</small>
      <strong>{filled ? step.sufVal[i] : '?'}</strong>
      <span>{filled ? `from [${step.sufSrc[i]}]` : 'not yet'}</span>
    </div>)
  }

  const retained = step.bestSplit >= 0
    ? `score ${step.best} at split ${step.bestSplit} (prefix ${step.bestPrefix} minus suffix min ${step.bestSuffixMin})`
    : 'none yet'

  return <div className="split-view">
    <section aria-label="nums with split boundary" className="split-section">
      <h3>nums, prefix and suffix around the split</h3>
      <div className="split-row">{cells}</div>
    </section>

    <section aria-label="suffix minimum row" className="split-section">
      <h3>suffix_min, filled right to left</h3>
      <div className="split-row">{sufCells}</div>
      <p className="split-note">Each cell keeps the smallest value from its index to the end and the index that supplied it.</p>
    </section>

    <section aria-label="current candidate" className="split-section split-candidate">
      <h3>{step.phase === 'done' ? 'Final split (the retained optimum)' : 'Current candidate'}</h3>
      {hasSplit ? <p>
        prefix sum nums[0..{k}] = <b>{show(step.prefix)}</b>
        {' · '}suffix min nums[{k + 1}..] = <b>{show(step.sufMin)}</b> (from index {show(candidateSource)})
        {' · '}score = {show(step.prefix)} − {show(step.sufMin)} = <b>{show(step.score)}</b>
      </p> : <p>No split is being evaluated yet.</p>}
      {step.ok !== null && step.phase !== 'done' && <p className="split-verdict">{step.ok ? 'Beats the retained optimum.' : 'Does not beat the retained optimum, so the optimum is kept.'}</p>}
    </section>

    <section aria-label="retained optimum" className="split-section split-retained">
      <h3>Retained optimum</h3>
      <p>{retained}</p>
      {step.phase === 'done' && <p className="split-verdict">Final answer: {step.best}, from split {step.bestSplit}.</p>}
    </section>

    <output aria-label="Split score">{step.message}</output>
  </div>
}
