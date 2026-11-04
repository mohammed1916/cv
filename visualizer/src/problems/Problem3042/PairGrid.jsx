// Upper triangle of word pairs (earlier i, later j). Cells checked so far show whether the earlier word is both a prefix and a suffix.
export default function PairGrid({ words, run, step }) {
  const frames = run?.frames ?? []
  const upto = frames.indexOf(step)
  const checked = new Map()
  frames.slice(0, upto + 1).forEach(f => { if (f.phase === 'pair') checked.set(`${f.i}-${f.j}`, f.match) })
  const n = words.length
  const cell = { width: 34, height: 34, textAlign: 'center', border: '1px solid var(--surface2)', color: 'var(--text)', fontSize: 13 }
  return <section aria-label="Pairs checked" style={{ overflowX: 'auto', margin: '8px 0' }}>
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr><th style={{ ...cell, width: 'auto', padding: '0 6px' }} /> {words.map((w, j) => <th key={j} style={{ ...cell, padding: '0 6px' }} scope="col">{w}</th>)}</tr></thead>
      <tbody>{words.map((w, i) => <tr key={i}>
        <th scope="row" style={{ ...cell, width: 'auto', padding: '0 6px' }}>{w}</th>
        {Array.from({ length: n }, (_, j) => {
          if (j <= i) return <td key={j} style={{ ...cell, opacity: 0.25 }} />
          const key = `${i}-${j}`
          const isNow = step.i === i && step.j === j
          const known = checked.has(key)
          return <td key={j} style={{ ...cell, fontWeight: isNow ? 700 : 400, background: isNow ? 'var(--surface2)' : 'transparent', outline: isNow ? '2px solid var(--primary)' : 'none' }}>
            {known ? (checked.get(key) ? 'yes' : 'no') : ''}
          </td>
        })}
      </tr>)}</tbody>
    </table>
    <p style={{ color: 'var(--text)', fontSize: 13 }}>Row = earlier word, column = later word. A yes means the row word is both a prefix and a suffix of the column word.</p>
  </section>
}
