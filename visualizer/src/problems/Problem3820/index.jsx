import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  number: 3820,
  phases: [
    { id: 'distances', label: 'Distances', description: 'One breadth-first search from each target node.' },
    { id: 'check', label: 'Check', description: 'Sort the three distances and test the squared sum.' },
    { id: 'done', label: 'Result', description: 'Report how many nodes passed.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges (pairs), and three distinct targets x, y, z',
  url: 'https://leetcode.com/problems/pythagorean-distance-nodes-in-a-tree/',
  complexity: 'O(n) time: three breadth-first searches and one pass over the nodes.',
  examples: [
    { label: 'Star', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"x":1,"y":2,"z":3}' },
    { label: 'Path', input: '{"n":4,"edges":[[0,1],[1,2],[2,3]],"x":0,"y":3,"z":2}' },
  ],
}

export default function PythagoreanDistanceNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <table aria-label="Distances per node">
      <thead><tr><th>node</th><th>to x, y, z</th><th>sorted check</th></tr></thead>
      <tbody>{step.table.map(row => <tr key={row.u} data-special={row.special ? 'yes' : undefined} data-current={step.at === row.u ? 'yes' : undefined}>
        <td>{row.u}</td><td>{row.distances.join(', ')}</td><td>{row.special ? 'special' : 'no'}</td></tr>)}</tbody>
    </table>
    <output aria-label="Count so far">{`special so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Each target contributes one breadth-first search, which gives the exact distance from every node to that target.</p>
    <p>Sorting the three distances puts the candidate legs first and the candidate hypotenuse last, so one squared comparison decides each node. A zero distance is allowed.</p>
  </>} />
}
