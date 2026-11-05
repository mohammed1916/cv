import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import OperationLog from '../../components/shared/OperationLog'
import { buildTrace, parseInput, code, python } from './algorithm'

const COLUMNS = ['A', 'B', 'C', 'D', 'E']

const definition = {
  phases: [
    { id: 'start', label: 'Empty sheet', description: 'No cell is stored yet.' },
    { id: 'set', label: 'Set', description: 'Store a value in a cell.' },
    { id: 'reset', label: 'Reset', description: 'Remove a cell so it reads as zero.' },
    { id: 'get', label: 'Formula', description: 'Add two operands.' },
    { id: 'done', label: 'Result', description: 'Every operation has run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with rows (1 to 9) and ops (set, reset or get lists)',
  url: 'https://leetcode.com/problems/design-spreadsheet/',
  complexity: 'Each operation is O(1) with a map of stored cells. The visualization shows columns A to E only.',
  examples: [
    { label: 'Three rows', input: '{"rows":3,"ops":[["set","C3",4],["set","A1",2],["get","=A1+C3"],["reset","C3"],["get","=A1+C3"]]}' },
  ],
}

export default function DesignSpreadsheet() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table className="algorithm-sheet" aria-label="Spreadsheet cells">
      <thead><tr><th scope="col" aria-label="Row"> </th>{COLUMNS.map(c => <th scope="col" key={c}>{c}</th>)}</tr></thead>
      <tbody>{Array.from({ length: run.input.rows }, (_, r) => r + 1).map(row => <tr key={row}>
        <th scope="row">{row}</th>
        {COLUMNS.map(c => {
          const name = `${c}${row}`
          const stored = Object.prototype.hasOwnProperty.call(step.cells, name)
          return <td key={name} data-cell={name} data-active={step.at === name ? 'yes' : undefined}
            aria-current={step.at === name ? 'step' : undefined}>
            {stored ? step.cells[name] : <span aria-label="unset">0</span>}
          </td>
        })}
      </tr>)}</tbody>
    </table>
    <OperationLog title="Operation timeline" ops={run.input.ops.reduce((acc, op, i) => { acc.push({ name: op[0], args: op.slice(1).join(' '), returned: op[0] === 'get' ? run.result[acc.filter(o => o.name === 'get').length] : undefined }); return acc }, [])} current={step.op} through={step.op} />
    <output aria-label="Formula results">{step.results.length ? `results: ${step.results.join(', ')}` : 'no formula results yet'}</output>
  </>} renderReasoning={() => <>
    <p>The sheet keeps only the cells that were set. Reading a cell that is not stored gives zero, so a reset simply removes the entry.</p>
    <p>A formula reads each operand once at the moment of the call and adds them, which is why later changes do not alter earlier results.</p>
  </>} />
}
