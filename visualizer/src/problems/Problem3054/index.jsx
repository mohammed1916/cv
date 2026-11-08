import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, sql, python, phases } from './algorithm'
import { meta } from './meta'

const inputLabel = 'JSON object with a Tree list of {N, P} rows'
const complexity = 'O(n) time with a set of parent ids, where n is the number of nodes.'
const examples = [
  { label: 'Teaching sample', input: JSON.stringify({ Tree: [{ N: 7, P: null }, { N: 3, P: 7 }, { N: 9, P: 3 }, { N: 4, P: 7 }] }) },
  { label: 'Single node', input: JSON.stringify({ Tree: [{ N: 1, P: null }] }) },
  { label: 'Single root', input: '{"Tree":[{"N":1,"P":null}]}' },
  { label: 'Two leaves', input: '{"Tree":[{"N":1,"P":null},{"N":2,"P":1},{"N":3,"P":1}]}' },
  { label: 'Chain of 15', input: '{"Tree":[{"N":1,"P":null},{"N":2,"P":1},{"N":3,"P":2},{"N":4,"P":3},{"N":5,"P":4},{"N":6,"P":5},{"N":7,"P":6},{"N":8,"P":7},{"N":9,"P":8},{"N":10,"P":9},{"N":11,"P":10},{"N":12,"P":11},{"N":13,"P":12},{"N":14,"P":13},{"N":15,"P":14}]}' },
  { label: 'Long run: 15 nodes', input: '{"Tree":[{"N":1,"P":null},{"N":2,"P":1},{"N":3,"P":2},{"N":4,"P":2},{"N":5,"P":2},{"N":6,"P":5},{"N":7,"P":2},{"N":8,"P":3},{"N":9,"P":6},{"N":10,"P":5},{"N":11,"P":8},{"N":12,"P":5},{"N":13,"P":6},{"N":14,"P":9},{"N":15,"P":14}]}' },
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
      <p>The sample tables are invented for this visualization.</p>
    </>} />
}
