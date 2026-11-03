import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with a Tree list of {N, P} rows'
const complexity = 'O(n) time with a set of parent ids, where n is the number of nodes.'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify({ Tree: [{ N: 7, P: null }, { N: 3, P: 7 }, { N: 9, P: 3 }, { N: 4, P: 7 }] }) },
  { label: 'Single node', input: JSON.stringify({ Tree: [{ N: 1, P: null }] }) },
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

export default function BinaryTreeNodes() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ step }) => <RowTable step={step} />}
    renderReasoning={() => <>
      <p>{meta.description}</p>
      <p>This is a knowledge-derived teaching model. The sample table was invented for this visualization and is not the official statement.</p>
    </>} />
}
