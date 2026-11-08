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
  { label: 'Single email', input: '{"Emails":[{"id":1,"email":"a@b"}]}' },
  { label: 'Duplicate emails', input: '{"Emails":[{"id":1,"email":"dup@example.com"},{"id":2,"email":"dup@example.com"}]}' },
  { label: 'Longest email, 38 characters', input: '{"Emails":[{"id":1,"email":"xxxxxxxxxxxxxxxxxxxxxxxxxx@example.com"}]}' },
  { label: 'Long run: 16 emails', input: '{"Emails":[{"id":1,"email":"czcbcb@ex.io"},{"id":2,"email":"xybyzc@ex.io"},{"id":3,"email":"azabcz@ex.io"},{"id":4,"email":"byzyza@ex.io"},{"id":5,"email":"yxybcb@ex.io"},{"id":6,"email":"zyxyzy@ex.io"},{"id":7,"email":"cxcbyz@ex.io"},{"id":8,"email":"xybaba@ex.io"},{"id":9,"email":"axaxyx@ex.io"},{"id":10,"email":"byzaby@ex.io"},{"id":11,"email":"yxyxyz@ex.io"},{"id":12,"email":"zyxabc@ex.io"},{"id":13,"email":"cxcxax@ex.io"},{"id":14,"email":"xybaxy@ex.io"},{"id":15,"email":"axazab@ex.io"},{"id":16,"email":"byzcxc@ex.io"}]}' },
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
      <p>The sample tables are invented for this visualization.</p>
    </>} />
}
