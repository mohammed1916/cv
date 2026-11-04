// Counts the prefixes p (each digit at most `limit`) with p <= bound, one digit place at a time.
export default function DigitPlaces({ bound, limit, s }) {
  // `bound` is the number being bounded (start - 1 or finish); its prefix is (bound - value of s) / 10^len(s).
  if (bound === null || bound === undefined) return null
  const sValue = Number(s)
  if (bound < sValue) return <p style={{ color: 'var(--text)' }}>{bound} is below {s}, so no prefix counts.</p>
  const prefixBound = Math.floor((bound - sValue) / 10 ** s.length)
  const digits = String(prefixBound).split('').map(Number)
  let stopped = false
  const rows = digits.map((d, i) => {
    const rest = digits.length - i - 1
    const choices = stopped ? 0 : Math.min(d, limit + 1)
    const contribution = choices * (limit + 1) ** rest
    const row = { d, rest, choices, contribution, stopHere: !stopped && d > limit }
    if (d > limit) stopped = true
    return row
  })
  const total = rows.reduce((sum, row) => sum + row.contribution, 0) + (stopped ? 0 : 1)
  return <section aria-label={`Prefix count up to ${prefixBound}`} style={{ marginTop: 8 }}>
    <p style={{ color: 'var(--text)', margin: '4px 0' }}>Prefix p runs from 0 to {prefixBound}, from ({bound} minus {s}) divided by 10 to the power of {s.length}; each digit of p may be 0 to {limit}. Then the number is p followed by {s}.</p>
    <table style={{ borderCollapse: 'collapse' }}>
      <thead><tr>{['digit of p', 'places after it', 'smaller allowed digits', 'prefixes with a smaller digit here'].map(h => <th key={h} scope="col" style={{ padding: '2px 8px', color: 'var(--text)', fontSize: 12 }}>{h}</th>)}</tr></thead>
      <tbody>{rows.map((row, i) => <tr key={i} style={{ background: row.stopHere ? 'var(--surface2)' : 'transparent' }}>
        <td style={cell}>{row.d}{row.stopHere ? ' (above limit)' : ''}</td>
        <td style={cell}>{row.rest}</td>
        <td style={cell}>{row.choices}</td>
        <td style={cell}>{row.contribution}</td>
      </tr>)}</tbody>
    </table>
    <p style={{ color: 'var(--text)' }}>Total prefixes: {total}</p>
  </section>
}
const cell = { padding: '2px 8px', textAlign: 'center', color: 'var(--text)', border: '1px solid var(--surface2)' }
