import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3809,
  phases: [
    { id: 'check', label: 'Range', description: 'Measure each tower with the Manhattan distance.' },
    { id: 'best', label: 'Best', description: 'Replace the best tower when quality, then coordinate, is better.' },
    { id: 'done', label: 'Result', description: 'Report the chosen coordinate.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with towers ([x, y, q] rows), center and radius',
  url: 'https://leetcode.com/problems/best-reachable-tower/',
  complexity: 'O(n) time: one distance check and one comparison per tower.',
  examples: [
    { label: 'Tie break', input: '{"towers":[[1,3,5],[2,2,5],[9,9,30]],"center":[0,0],"radius":5}' },
    { label: 'Nothing reachable', input: '{"towers":[[10,10,3]],"center":[0,0],"radius":4}' },
  ],
}

export default function BestReachableTower() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Towers">
      <thead><tr><th>index</th><th>x, y</th><th>quality</th><th>distance to center</th><th>state</th></tr></thead>
      <tbody>{run.input.towers.map(([x, y, q], i) => {
        const distance = Math.abs(x - run.input.center[0]) + Math.abs(y - run.input.center[1])
        const reachable = distance <= run.input.radius
        return <tr key={i} data-current={step.at === i ? 'yes' : undefined}>
          <td>{i}</td><td>{x}, {y}</td><td>{q}</td><td>{distance}</td><td>{reachable ? 'reachable' : 'out of range'}</td>
        </tr>
      })}</tbody>
    </table>
    <output aria-label="Best so far">{step.best ? `best (${step.best[0]}, ${step.best[1]})` : 'no best yet'}{` · center (${run.input.center[0]}, ${run.input.center[1]}), radius ${run.input.radius}`}</output>
  </>} renderReasoning={() => <>
    <p>The Manhattan distance adds the horizontal and vertical gaps. A tower is reachable when that sum is at most the radius.</p>
    <p>Among reachable towers, a higher quality wins. An equal quality is settled by the smaller x, then the smaller y.</p>
  </>} />
}
