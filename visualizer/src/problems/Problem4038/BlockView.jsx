import './BlockView.css'

// Draws the array as coloured blocks of equal values, with a table of block counts per value.
export default function BlockView({ run, step }) {
  const nums = run.input
  const runCount = new Map(step.runs ?? [])
  const singles = new Set(step.singles ?? [])
  const blockIds = []
  let block = -1
  nums.forEach((value, i) => {
    if (i === 0 || nums[i - 1] !== value) block += 1
    blockIds.push(block)
  })

  return (
    <section className="blk" aria-label="Single block values">
      <div className="blk-row" role="list" aria-label="Array values">
        {nums.map((value, i) => (
          <div
            key={i}
            role="listitem"
            className={`blk-cell blk-cell--b${blockIds[i] % 4}${i === step.at ? ' blk-cell--now' : ''}`}
          >
            <span className="blk-index">{i}</span>
            <span className="blk-value">{value}</span>
          </div>
        ))}
      </div>

      <table className="blk-table">
        <caption>Blocks started per value</caption>
        <thead>
          <tr><th scope="col">Value</th><th scope="col">Blocks</th><th scope="col">Verdict</th></tr>
        </thead>
        <tbody>
          {[...new Set(nums)].map(value => {
            const count = runCount.get(value) ?? 0
            const verdict = count === 0 ? 'not seen yet' : count === 1 ? 'single block (counted)' : 'split (not counted)'
            return (
              <tr key={value} className={singles.has(value) ? 'blk-counted' : ''}>
                <td>{value}</td>
                <td>{count}</td>
                <td>{verdict}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="blk-note">{step.kind === 'new' ? 'A new block begins at this index.' : step.kind === 'continue' ? 'The current block continues.' : ''}</p>
    </section>
  )
}
