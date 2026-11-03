import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with an Emails list of {id, email} rows'
const complexity = 'O(n log d) time for n email rows and d distinct domains, using a map of counts.'
const examples = [
  {
    label: 'Teaching sample',
    input: JSON.stringify({ Emails: [
      { id: 1, email: 'Ana@Mail.com' }, { id: 2, email: 'ben@mail.com' }, { id: 3, email: 'cy@mail.org' },
      { id: 4, email: 'dee@corp.com' }, { id: 5, email: 'eli@mail.com' }, { id: 6, email: 'fay@corp.net' },
      { id: 7, email: 'gil@corp.com' },
    ] }),
  },
  { label: 'No .com domain', input: JSON.stringify({ Emails: [{ id: 1, email: 'x@y.org' }] }) },
]

const definition = { number: meta.number, phases, parse: parseInput, build: buildTrace, code, sql, python, inputLabel, complexity, examples }

function RowTable({ step }) {
  const { columns, rows } = step
  return <div style={{ overflowX: 'auto' }} role="region" aria-label="Current rows">
    <table>
      <thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
      <tbody>{rows.length === 0
        ? <tr><td colSpan={columns.length}>No rows</td></tr>
        : rows.map((row, index) => <tr key={index}>
          {columns.map(column => <td key={column}>{row[column] === null ? 'NULL' : String(row[column])}</td>)}
        </tr>)}</tbody>
    </table>
  </div>
}

export default function FindAllUniqueEmailDomains() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization and is not the official statement.</p>
    </>} />
}
