// The pile is drawn top first. The candidate being considered is outlined; the best value so far is highlighted.
export default function PileView({ run, step }) {
  const { nums, k } = run.input
  const best = step.ans ?? null
  return (
    <div className="pile-view">
      <p>Moves: <strong>{k}</strong>. The top of the pile is the first value.</p>
      <div className="pile" role="img" aria-label={`Pile ${nums.join(', ')}`}>
        {nums.map((v, i) => <div key={i} className={`pile-item${i === step.candidate ? ' is-candidate' : ''}${v === best && step.candidate !== undefined ? ' is-best' : ''}`}>
          <small>{i === 0 ? 'top' : `depth ${i}`}</small><strong>{v}</strong>
          {i === step.candidate && <span className="pile-tag">{step.candidate === k ? 'index k' : `index ${i}`}</span>}
        </div>)}
      </div>
      {step.phase === 'done' && step.result !== undefined && <p>The best top value is {step.result}.</p>}
      {step.candidate !== undefined && <p>Best so far: {best}.</p>}
    </div>
  )
}
