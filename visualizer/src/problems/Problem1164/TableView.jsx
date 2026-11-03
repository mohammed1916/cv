import './TableView.css'

export default function TableView({ run, step }) {
  const done = step?.phase === 'done'
  return <section className="sql-table-view" aria-label="Table state">
    <h3>Working table</h3>
    <p className="sql-table-view__note">{step?.message}</p>
    <Table columns={step?.columns ?? []} rows={step?.rows ?? []} empty="No rows at this step." />
    <h3>Result</h3>
    {done
      ? <Table columns={step.columns} rows={run.result} empty="The query returns no rows." />
      : <p className="sql-table-view__note">The result is written at the final step.</p>}
  </section>
}

function Table({ columns, rows, empty }) {
  if (!rows.length) return <p className="sql-table-view__note">{empty}</p>
  return <div className="sql-table-view__scroll">
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.map((row, index) => <tr key={index}>
        {columns.map(column => <td key={column}>{row[column] === null || row[column] === undefined ? 'NULL' : String(row[column])}</td>)}
      </tr>)}</tbody>
    </table>
  </div>
}
