import './MirrorSlotsView.css'

export default function MirrorSlotsView({ run, step }) {
  const n = run.input.length
  const letters = [...step.prefix]
  const counts = {}
  for (const ch of run.input) counts[ch] = (counts[ch] || 0) + 1
  const used = {}
  for (const ch of letters) used[ch] = (used[ch] || 0) + 1
  const left = Object.keys(counts).sort().map(ch => ({ ch, n: counts[ch] - (used[ch] || 0) })).filter(x => x.n > 0)
  const isOdd = n % 2 === 1
  return (
    <div className="msv">
      {isOdd ? <p className="msv__warn" role="status">Odd length: the middle letter sits opposite itself, so no anti-palindrome exists.</p> : (
        <ol className="msv__slots" aria-label="Positions of the arrangement">
          {Array.from({ length: n }, (_, i) => {
            const mirror = n - 1 - i
            const current = step.pos === i
            const mirrored = step.mirror === i
            return (
              <li key={i} className={`msv__slot${i < letters.length ? ' is-filled' : ''}${current ? ' is-current' : ''}${mirrored ? ' is-mirror' : ''}`}>
                <span className="msv__pos">{i}</span>
                <span className="msv__role" aria-hidden="true">{current ? 'l' : mirrored ? 'r' : ''}</span>
                <span className="msv__letter">{i < letters.length ? letters[i] : '·'}</span>
                <span className="msv__pair">pairs with {mirror}</span>
              </li>
            )
          })}
        </ol>
      )}
      <div className="msv__counts" aria-label="Letters still available">
        <span className="msv__label">Letters left</span>
        {left.length === 0 ? <span>none</span> : left.map(x => <span key={x.ch} className="msv__chip">{x.ch} × {x.n}</span>)}
      </div>
      {step.tried && !isOdd ? (
        <p className={`msv__try${step.feasible === false ? ' is-rejected' : ' is-kept'}`} role="status">
          Trying {step.tried} at position {step.pos}: {step.message}
        </p>
      ) : <p className="msv__try" role="status">{step.message}</p>}
    </div>
  )
}
