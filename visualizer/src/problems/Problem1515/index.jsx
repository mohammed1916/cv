import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Average', description: 'Start at the average of the points.' },
    { id: 'step', label: 'Move', description: 'Move to the distance-weighted average of the points.' },
    { id: 'done', label: 'Complete', description: 'Report the total distance from the final point.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with positions, a list of [x, y] pairs (JSON)',
  url: 'https://leetcode.com/problems/best-position-for-a-service-centre/',
  complexity: 'O(n * iterations) time with a fixed iteration count. The visualization caps input at 8 points.',
  examples: [
    { label: 'Square', input: '{"positions":[[0,0],[0,2],[2,0],[2,2]]}' },
    { label: 'Two points', input: '{"positions":[[0,0],[10,0]]}' },
  ],
}

export default function ServiceCentre() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Service points">
      <thead><tr><th>Point</th><th>Distance to candidate</th></tr></thead>
      <tbody>{run.input.positions.map(([px, py], i) => <tr key={i}>
        <td>{`(${px}, ${py})`}</td>
        <td>{Math.hypot(px - step.x, py - step.y).toFixed(3)}</td>
      </tr>)}</tbody>
    </table>
    <output aria-label="Candidate">{`Candidate (${step.x.toFixed(3)}, ${step.y.toFixed(3)}), total distance ${step.sum.toFixed(4)}`}</output>
  </>} renderReasoning={() => <>
    <p>The total distance is convex, so any local improvement points toward the single minimum, the geometric median.</p>
    <p>Weiszfeld's update moves to the average of the points weighted by inverse distance, which lowers the total at each step.</p>
  </>} />
}
