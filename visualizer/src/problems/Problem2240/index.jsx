import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: '2240',
  phases: [
    { id: 'setup', label: 'Start', description: 'Work out how many pens can be bought at most.' },
    { id: 'count', label: 'Count', description: 'For this many pens, count the pencil choices that fit the rest.' },
    { id: 'done', label: 'Result', description: 'Return the total number of ways.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON {"total": 12, "cost1": 4, "cost2": 3}',
  url: 'https://leetcode.com/problems/number-of-ways-to-buy-pens-and-pencils/',
  complexity: 'O(total / cost1) time and O(1) extra space. Each pen count contributes one closed-form pencil count.',
  examples: [
    { label: 'Example', input: '{"total":12,"cost1":4,"cost2":3}' },
    { label: 'Small', input: '{"total":7,"cost1":2,"cost2":5}' },
  ],
}

export default function PensAndPencils() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <>
    <table aria-label="Pen counts">
      <thead><tr><th scope="col">Pens</th><th scope="col">Money left</th><th scope="col">Pencil choices</th><th scope="col">Running total</th></tr></thead>
      <tbody>{step.rows.map(row => <tr key={row.pens} data-current={row.pens === step.pens ? 'true' : undefined}
        style={{ background: row.pens === step.pens ? 'var(--surface2)' : undefined, color: 'var(--text)' }}>
        <td>{row.pens}</td><td>{row.left}</td><td>{row.pencils}</td><td>{row.ways}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Running total">{`ways ${step.ways}`}</output>
    <p role="status">{step.message}</p>
  </>} renderReasoning={() => <>
    <p>Fix how many pens are bought. The money left then decides how many pencils fit, from none up to the maximum, so each pen count adds that many ways.</p>
    <p>The empty purchase is one of the ways, and it is included because the pen count starts at zero.</p>
  </>} />
}
