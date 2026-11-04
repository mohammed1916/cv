// Stage pipeline plus the rows the query holds at this step. Rows marked kept/dropped are shaded.
export default function SqlStages({ phases, step, resultCount }) {
  const current = phases.findIndex(phase => phase.id === step.phase)
  return <section className="sql-stages" aria-label="SQL stages">
    <ol className="sql-stages__pipeline">
      {phases.map((phase, index) => <li key={phase.id}
        className={index === current ? 'is-current' : index < current ? 'is-done' : 'is-ahead'}
        aria-current={index === current ? 'step' : undefined}>
        <strong>{phase.label}</strong><span>{phase.description}</span>
      </li>)}
    </ol>
    <div className="sql-stages__table">
      <table>
        <caption>{step.phase === 'done' ? `Output: ${resultCount} rows` : `Rows at this stage: ${step.rows.length}`}</caption>
        <thead><tr>{step.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{step.rows.length ? step.rows.map((row, index) => <tr key={index}
          className={row.kept === 'yes' ? 'is-kept' : row.kept === 'no' ? 'is-dropped' : undefined}>
          {step.columns.map(column => <td key={column}>{String(row[column] ?? '')}</td>)}
        </tr>) : <tr><td colSpan={Math.max(1, step.columns.length)}>No rows at this stage</td></tr>}</tbody>
      </table>
    </div>
    <output aria-label="Query output">{step.message}</output>
  </section>
}
