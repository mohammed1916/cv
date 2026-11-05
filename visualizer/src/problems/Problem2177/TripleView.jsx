// A number line marks the total. The three integers are drawn around the middle value x = num / 3.
export default function TripleView({ run, step }) {
  const { num } = run.input
  const trio = step.result ?? []
  const x = step.x
  return (
    <div className="triple-view">
      <p>Total: <strong>{num}</strong> · remainder mod 3: <strong>{num % 3}</strong></p>
      <div className="triple-row" role="img" aria-label={trio.length ? `Integers ${trio.join(', ')}` : 'No triple'}>
        {trio.length === 0 && step.phase === 'done' && <div className="triple-empty">No three consecutive integers sum to {num}.</div>}
        {trio.map((value, i) => <div key={i} className={`triple-cell${i === 1 ? ' is-middle' : ''}`}>
          <small>{i === 1 ? 'middle x' : i === 0 ? 'x - 1' : 'x + 1'}</small><strong>{value}</strong>
        </div>)}
      </div>
      {x !== undefined && <p>Middle value: {num} / 3 = {x}. The sum is 3 × {x} = {3 * x}.</p>}
    </div>
  )
}
