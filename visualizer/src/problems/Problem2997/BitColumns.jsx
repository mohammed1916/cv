// Bits of the running XOR and of k, one column per bit. Columns where they differ are the flips still needed.
export default function BitColumns({ total, k, diff, width = 4 }) {
  const bits = n => Array.from({ length: width }, (_, i) => width - 1 - i).map(i => (n >> i) & 1)
  const cols = Array.from({ length: width }, (_, i) => width - 1 - i)
  const difference = diff ?? (total ^ k)
  const rows = [['Total XOR', total, bits(total)], ['k', k, bits(k)], ['Differing bits', difference, bits(difference)]]
  return <table aria-label="Bit comparison" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
    <thead><tr><th scope="col" />{cols.map(i => <th key={i} scope="col" style={{ padding: '2px 10px', color: 'var(--text)', opacity: 0.7 }}>2<sup>{i}</sup></th>)}<th scope="col" /></tr></thead>
    <tbody>{rows.map(([label, value, row]) => <tr key={label}>
      <th scope="row" style={{ textAlign: 'left', paddingRight: 10, color: 'var(--text)' }}>{label}</th>
      {row.map((bit, index) => {
        const differs = label === 'Differing bits' ? bit === 1 : ((total ^ k) >> cols[index]) & 1
        return <td key={index} style={{
          textAlign: 'center', padding: '4px 10px', fontFamily: 'monospace', color: 'var(--text)',
          background: label === 'Differing bits' && bit === 1 ? 'var(--primary)' : 'transparent',
          border: '1px solid var(--surface2)', opacity: label !== 'Differing bits' && differs ? 1 : 0.9,
        }}>{bit}</td>
      })}
      <td style={{ paddingLeft: 10, color: 'var(--text)' }}>= {value}</td>
    </tr>)}</tbody>
  </table>
}
