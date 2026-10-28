import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'The frog begins at vertex 1 with probability 1.' },
    { id: 'visit', label: 'Visit', description: 'Take the next vertex from the queue.' },
    { id: 'split', label: 'Split', description: 'Share its probability among the unvisited children.' },
    { id: 'check', label: 'Check time', description: 'Decide whether the target counts at time t.' },
    { id: 'done', label: 'Complete', description: 'Report the probability at the target.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with n, edges (a tree), t and target',
  url: 'https://leetcode.doocs.org/en/lc/1377/',
  complexity: 'O(n) time and O(n) space for the breadth-first search.',
  examples: [
    { label: 'Example 1', input: '{"n": 7, "edges": [[1,2],[1,3],[1,7],[2,4],[2,6],[3,5]], "t": 2, "target": 4}' },
    { label: 'Example 2', input: '{"n": 7, "edges": [[1,2],[1,3],[1,7],[2,4],[2,6],[3,5]], "t": 1, "target": 7}' },
  ],
}

export default function FrogPosition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => (
    <>
      <table aria-label="Probability by vertex">
        <tbody>
          {step.prob.slice(1).map((p, i) => (
            <tr key={i} data-current={i + 1 === step.vertex ? 'yes' : 'no'}>
              <th scope="row">{`Vertex ${i + 1}`}</th>
              <td>{p.toFixed(4)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <output aria-label="Target">{`Target ${run.target} after ${run.t} seconds`}</output>
    </>
  )} renderReasoning={() => <>
    <p>The frog never returns to a visited vertex, so the tree rooted at vertex 1 fixes every path.</p>
    <p>A vertex with children gives its probability away at the next second, while a leaf keeps it for the rest of the time.</p>
  </>} />
}
