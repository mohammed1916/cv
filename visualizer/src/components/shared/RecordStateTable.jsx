import './RecordStateTable.css'

export default function RecordStateTable({ label, columns, rows, activeRow = -1 }) {
  return <div className="record-state"><table>
    <caption>{label}</caption>
    <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
    <tbody>{rows.length ? rows.map((row, index) => <tr key={index} className={index === activeRow ? 'record-state__active' : undefined}>
      {columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column] ?? '')}</td>)}
    </tr>) : <tr><td colSpan={Math.max(1, columns.length)}>No rows</td></tr>}</tbody>
  </table></div>
}
