// Positive integers on a line. Taken values are struck through; appended picks are filled; the last-seen pointer is marked.
export default function NumberLineView({ run, step }) {
  const { nums, k } = run.input
  const taken = new Set(nums)
  const picked = new Set(step.picked ?? [])
  const top = Math.max(...nums, ...(step.picked ?? []), 0) + Math.max(1, k - picked.size) + 1
  const cells = Array.from({ length: Math.min(top, 45) }, (_, i) => i + 1)
  return (
    <div className="number-line-view">
      <div className="line-cells" role="img" aria-label={`Integers 1 to ${cells.length}; taken ${[...taken].join(', ')}`}>
        {cells.map(v => {
          const cls = picked.has(v) ? 'is-picked' : taken.has(v) ? 'is-taken' : ''
          return <div key={v} className={`line-cell ${cls}${v === step.last ? ' is-last' : ''}`}>
            <small>{v}</small>
            <strong>{picked.has(v) ? '+' : taken.has(v) ? 'x' : ''}</strong>
            {v === step.last && <span className="line-pointer">last</span>}
          </div>
        })}
      </div>
      <p>Taken: {[...taken].sort((a, b) => a - b).join(', ')}. Appended so far: {(step.picked ?? []).join(', ') || 'none'}. Still needed: {step.remaining ?? k}.</p>
      <p>Running sum: <strong>{step.total ?? 0}</strong></p>
    </div>
  )
}
