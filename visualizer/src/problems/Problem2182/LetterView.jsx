// Letters from z down to a. hi is the largest letter being written, lo the separator chosen when hi runs out of room.
export default function LetterView({ run, step }) {
  const present = Array.from({ length: 26 }, (_, i) => i).filter(i => run.input.s.includes(String.fromCharCode(97 + i)) || step.count?.[i] > 0).reverse()
  const count = step.count ?? Array(26).fill(0)
  const letter = i => String.fromCharCode(97 + i)
  return (
    <div className="letter-view">
      <div className="letter-row" role="img" aria-label="Letters left to place">
        {present.map(i => <div key={i} className={`letter-cell${i === step.hi ? ' is-hi' : ''}${i === step.lo ? ' is-lo' : ''}`}>
          <strong>{letter(i)}</strong>
          <span>{count[i]} left</span>
          {i === step.hi && <small>hi</small>}
          {i === step.lo && <small>lo</small>}
        </div>)}
      </div>
      <p>Limit: <strong>{run.input.limit}</strong> copies in a row.</p>
      <p>Built so far: <code className="built-string">{step.result || '(empty)'}</code></p>
    </div>
  )
}
