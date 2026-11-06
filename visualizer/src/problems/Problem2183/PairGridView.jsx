import IndexedSequence from '../../components/shared/IndexedSequence'

// A triangle of pairs: row j, column i for i < j. Checked pairs are coloured by whether the product is divisible by k.
export default function PairGridView({ run, step }) {
  const { nums, k } = run.input
  const n = nums.length
  const results = new Map()
  for (const frame of run.frames) {
    if (frame.phase !== 'pair') continue
    if (frame.i === step.i && frame.j === step.j) break
    results.set(`${frame.i},${frame.j}`, frame.ok)
  }
  return (
    <div className="pair-grid-view">
      <IndexedSequence label="nums (input array): i and j mark the pair" length={n} valueAt={i => nums[i]} active={step.j} roleAt={i => (i === step.i ? 'i' : '')} />
      <p>Each cell is a pair (i, j), i &lt; j. Green: product divisible by {k}. Rose: not divisible. Current pair outlined.</p>
      <table className="pair-grid" aria-label="Pairs checked">
        <thead><tr><th />{nums.map((v, i) => <th key={i}>{i}<br />{v}</th>)}</tr></thead>
        <tbody>
          {nums.map((vj, j) => <tr key={j}>
            <th>{j}<br />{vj}</th>
            {nums.map((_, i) => {
              if (i >= j) return <td key={i} className="is-blank" />
              const key = `${i},${j}`
              const current = step.i === i && step.j === j
              const status = results.has(key) ? (results.get(key) ? 'is-yes' : 'is-no') : current ? (step.ok ? 'is-yes' : 'is-no') : ''
              return <td key={i} className={`${status}${current ? ' is-current' : ''}`}>{step.phase === 'pair' || results.has(key) ? (nums[i] * vj) : ''}</td>
            })}
          </tr>)}
        </tbody>
      </table>
      <p>Pairs counted so far: <strong>{step.ans}</strong></p>
    </div>
  )
}
