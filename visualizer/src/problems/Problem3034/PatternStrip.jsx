// For the current window, each adjacent pair becomes an arrow (up, equal or down) set against the pattern entry it must match.
const arrow = s => (s > 0 ? 'up' : s < 0 ? 'down' : 'equal')

export default function PatternStrip({ nums, pattern, start, k }) {
  if (start === undefined || start < 0) return null
  const m = pattern.length
  return <table aria-label="Pattern comparison for the current window" style={{ borderCollapse: 'collapse', margin: '8px 0', color: 'var(--text)' }}>
    <tbody>
      <tr><th scope="row" style={th}>pair</th>{pattern.map((_, j) => {
        const a = nums[start + j], b = nums[start + j + 1]
        return <td key={j} style={{ ...td, fontWeight: j === k ? 700 : 400, background: j === k ? 'var(--surface2)' : 'transparent' }}>{a} to {b}</td>
      })}</tr>
      <tr><th scope="row" style={th}>pattern</th>{pattern.map((p, j) => <td key={j} style={td}>{arrow(p)}</td>)}</tr>
      <tr><th scope="row" style={th}>actual</th>{pattern.map((_, j) => {
        const a = nums[start + j], b = nums[start + j + 1]
        const s = b > a ? 1 : b < a ? -1 : 0
        return <td key={j} style={{ ...td, opacity: k !== undefined && j > k ? 0.35 : 1 }}>{arrow(s)}</td>
      })}</tr>
    </tbody>
    <caption style={{ textAlign: 'left', fontSize: 12, opacity: 0.8 }}>{m} adjacent pairs, all must match in order.</caption>
  </table>
}
const th = { textAlign: 'left', padding: '2px 8px', fontSize: 12 }
const td = { padding: '2px 8px', textAlign: 'center', border: '1px solid var(--surface2)', fontSize: 12 }
