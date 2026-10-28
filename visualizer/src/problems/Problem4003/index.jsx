import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at (0, 0) with an odd next action.' },
    { id: 'settle', label: 'Settle', description: 'Take the cheapest unsettled state and expand it.' },
    { id: 'done', label: 'Complete', description: 'Reach the bottom right cell.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid (JSON object with m, n and penalty)',
  url: 'https://leetcode.doocs.org/en/lc/4003/',
  complexity: 'O(mn log(mn)) time with a heap. The visualization caps the grid at 16 cells.',
  examples: [
    { label: 'Example 1', input: '{"m":2,"n":2,"penalty":[[5,3],[1,4]]}' },
    { label: 'Example 3', input: '{"m":2,"n":3,"penalty":[[8,0,9],[7,4,1]]}' },
  ],
}

export default function MinimumCostAlternatingPath() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <table aria-label="Penalty grid">
    <tbody>{run.input.penalty.map((row, i) => <tr key={i}>{row.map((v, j) => <td key={j}
      data-active={i === step.i && j === step.j ? 'true' : undefined}>{`${v} (entry ${(i + 1) * (j + 1)})`}</td>)}</tr>)}</tbody>
  </table>} renderReasoning={() => <>
    <p>Each move alternates between the right and down directions on odd actions and the left and up directions on even ones.</p>
    <p>Dijkstra runs over the pair of cell and next-action parity, so a wrong-way move or a wait is just another edge with a cost.</p>
  </>} />
}
