import './PairGridView.css'

/**
 * Rows and columns are set-bit counts that occur in nums. A cell is excellent when row + column is at least k,
 * and it holds tally[row] * tally[column] ordered pairs. The pair being added in this step is outlined.
 */
export default function PairGridView({ tally = [], k = 1, pair = null }) {
  const present = tally.map((count, bits) => (count > 0 ? bits : -1)).filter(bits => bits >= 0)
  if (present.length === 0) return null
  return <section className="pair-grid" aria-label="Bit-count pair grid">
    <p className="pair-grid__rule">A cell counts when row bits + column bits is at least {k}. Values in each cell are ordered pairs.</p>
    <table>
      <thead><tr><th scope="col">x \ y</th>{present.map(y => <th key={y} scope="col">{y}</th>)}</tr></thead>
      <tbody>{present.map(x => <tr key={x}>
        <th scope="row">{x}</th>
        {present.map(y => {
          const excellent = x + y >= k
          const current = pair && pair[0] === x && pair[1] === y
          return <td key={y} data-excellent={excellent || undefined} data-current={current || undefined}
            className={[excellent ? 'pair-grid__ok' : 'pair-grid__no', current ? 'pair-grid__current' : ''].join(' ')}>
            {excellent ? tally[x] * tally[y] : '-'}
          </td>
        })}
      </tr>)}</tbody>
    </table>
  </section>
}
