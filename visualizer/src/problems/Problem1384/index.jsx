import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'Products and sales periods (JSON)'
const complexity = 'Time grows with the number of calendar days covered by the periods.'
const examples = []
const reasoning = ['Each sales period is expanded into its calendar days, so leap years are counted through the date arithmetic rather than a fixed day count.', 'The days are then grouped by product and year, and the product name is attached last.']

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

const cell = { border: '1px solid currentColor', padding: '4px 8px', textAlign: 'left' }

// Plain table of the rows the query holds at this step.
function TableView({ view }) {
  return <section aria-label="Current table">
    <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>{view.caption}</h3>
    <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 14 }}>
      <thead><tr>{view.columns.map(column => <th key={column} style={cell}>{column}</th>)}</tr></thead>
      <tbody>{view.rows.length
        ? view.rows.map((row, index) => <tr key={index}>{view.columns.map(column => <td key={column} style={cell}>{String(row[column] ?? 'NULL')}</td>)}</tr>)
        : <tr><td style={cell} colSpan={view.columns.length}>No rows</td></tr>}</tbody>
    </table>
  </section>
}

export default function AlgorithmPage() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <TableView view={step.view} />}
    renderReasoning={() => reasoning.map(text => <p key={text}>{text}</p>)} />
}
