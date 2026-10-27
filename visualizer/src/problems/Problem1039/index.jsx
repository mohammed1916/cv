import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Table', description: 'Sides cost nothing.' },
    { id: 'length', label: 'Length', description: 'Move to sub-polygons spanning one more step.' },
    { id: 'try', label: 'Try apex', description: 'Try each vertex as the apex on the base.' },
    { id: 'keep', label: 'Keep', description: 'Store the cheapest triangulation for this base.' },
    { id: 'done', label: 'Complete', description: 'Report the minimum score for the whole polygon.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with values (vertex values in order, JSON)',
  url: 'https://leetcode.com/problems/minimum-score-triangulation-of-polygon/',
  complexity: 'O(n^3) time and O(n^2) space. The visualization caps the polygon at 8 vertices.',
  examples: [
    { label: 'Triangle', input: '{"values":[1,2,3]}' },
    { label: 'Square', input: '{"values":[3,7,4,5]}' },
  ],
}

export default function MinimumScoreTriangulation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const n = run.input.values.length
    return <>
      <table aria-label="Best costs for each base">
        <thead><tr><th>i \ j</th>{Array.from({ length: n }, (_, j) => <th key={j}>{j}</th>)}</tr></thead>
        <tbody>{step.best.map((row, i) => <tr key={i}><th>{i}</th>{row.map((v, j) => {
          const current = step.cell && step.cell[0] === i && step.cell[1] === j
          return <td key={j} data-role={current ? 'active' : undefined}>{j > i ? v : ''}</td>
        })}</tr>)}</tbody>
      </table>
      <output aria-label="Current apex">{step.apex === -1 ? 'No apex in use' : `Apex ${step.apex} for base ${step.cell[0]}-${step.cell[1]}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Every triangulation has a triangle sitting on the edge from the first vertex to the last. Its apex splits the polygon into two smaller polygons, which are solved first and stored in the table.</p>
    <p>The table fills from short bases to long ones, so each choice of apex reads answers that are already known.</p>
  </>} />
}
