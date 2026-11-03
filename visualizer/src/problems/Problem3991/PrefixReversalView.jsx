import './PrefixReversalView.css'

function Tiles({ values, reversedLength, label }) {
  return (
    <div className="prefix-reversal__line">
      <span className="prefix-reversal__label">{label}</span>
      <ol className="prefix-reversal__tiles">
        {values.map((v, i) => (
          <li key={i} className={['prefix-reversal__tile', reversedLength && i < reversedLength ? 'is-reversed' : '', v === i ? 'is-placed' : ''].filter(Boolean).join(' ')}>
            {v}
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function PrefixReversalView({ run, step }) {
  const n = run.input.nums.length
  const sorted = Array.from({ length: n }, (_, i) => i)
  return (
    <figure className="prefix-reversal" aria-label="Prefix reversal search">
      {step.cur ? <Tiles values={step.cur} label="Current" /> : null}
      {step.nxt ? <Tiles values={step.nxt} reversedLength={step.length} label={`After reversing ${step.length}`} /> : null}
      <Tiles values={sorted} label="Target" />
      <dl className="prefix-reversal__stats">
        <div><dt>Depth</dt><dd>{step.depth ?? '-'}</dd></div>
        <div><dt>Arrangements seen</dt><dd>{step.seen}</dd></div>
        <div><dt>Waiting in queue</dt><dd>{step.queued}</dd></div>
      </dl>
    </figure>
  )
}
