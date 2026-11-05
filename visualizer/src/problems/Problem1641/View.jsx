// Table of dp rows: one row per length, one column per vowel; the newest row is highlighted.
const VOWELS = ['a', 'e', 'i', 'o', 'u']

export default function View({ run, step }) {
  const rows = step.snapshot.rows
  return <div className="sorted-vowels-view">
    <table aria-label="Count of sorted strings ending in each vowel">
      <thead><tr><th>Length</th>{VOWELS.map(v => <th key={v}>ends {v}</th>)}<th>Total</th></tr></thead>
      <tbody>{rows.map((row, k) => <tr key={k} className={k === rows.length - 1 ? 'is-current' : ''}>
        <th>{k + 1}</th>{row.map((x, c) => <td key={c}>{x}</td>)}<td>{row.reduce((s, x) => s + x, 0)}</td>
      </tr>)}</tbody>
    </table>
    <p>{step.message}</p>
  </div>
}
