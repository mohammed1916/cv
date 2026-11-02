import './MirrorPairsView.css'

// Characters with mirror pairs joined. Green pairs match, red pairs need a change. Two slots show the change budget.
export default function MirrorPairsView({ run, step }) {
  const { s } = run.input
  const n = s.length
  const pairState = new Map()
  step.pairsDone.forEach(p => pairState.set(p.i, p.match))
  const cls = i => {
    const j = n - 1 - i
    const pairIndex = Math.min(i, j)
    if (pairState.has(pairIndex)) return `mirror-char ${pairState.get(pairIndex) ? 'mirror-char--pair-ok' : 'mirror-char--pair-bad'}${step.i === pairIndex || step.j === pairIndex ? ' mirror-char--active' : ''}`
    return 'mirror-char'
  }
  return (
    <div className="mirror-view">
      <div className="mirror-row" aria-label="String characters">
        {[...s].map((ch, i) => <span key={i} className={cls(i)}>{ch}</span>)}
      </div>
      <div className="mirror-budget" aria-label="Changes used">
        Changes needed so far: {step.mismatches}
        {[0, 1].map(k => <span key={k} className={`mirror-budget__slot${k < step.mismatches ? ' mirror-budget__slot--used' : ''}`} />)}
        <span>of 2 allowed</span>
      </div>
      <p className="mirror-caption">{step.i >= 0 ? `Pair ${step.i} and ${step.j}: ${step.match ? 'match' : 'differ'}.` : 'Pairs are checked from the outside in.'}</p>
      {step.result !== undefined && <p className="mirror-verdict">{step.result ? 'Palindrome reachable with at most two changes.' : 'Needs more than two changes.'}</p>}
    </div>
  )
}
