import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
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
    { label: "Single vertex", input: "{\"n\":1,\"edges\":[],\"t\":1,\"target\":1}" },
    { label: "Equal branches share the frog", input: "{\"n\":3,\"edges\":[[1,2],[1,3]],\"t\":1,\"target\":2}" },
    { label: "Chain of twenty at the limit", input: "{\"n\":20,\"edges\":[[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16],[16,17],[17,18],[18,19],[19,20]],\"t\":20,\"target\":20}" },
    { label: "Long run: 20 vertices", input: "{\"n\":20,\"edges\":[[1,2],[1,3],[2,4],[3,5],[1,6],[2,7],[7,8],[2,9],[1,10],[7,11],[7,12],[9,13],[10,14],[8,15],[7,16],[6,17],[11,18],[5,19],[11,20]],\"t\":20,\"target\":11}" },
  ],
}

export default function FrogPosition() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = {}
    step.prob.slice(1).forEach((p, i) => { if (p > 0) tags[i] = p.toFixed(3) })
    const visited = step.prob.slice(1).map((p, i) => (p > 0 ? i : -1)).filter(i => i >= 0)
    return <>
      <GraphTraversalView title="Tree from vertex 1" n={run.n} edges={run.edges.map(([a, b]) => [a - 1, b - 1])}
        labels={Array.from({ length: run.n }, (_, i) => String(i + 1))} current={step.vertex - 1} visited={visited} tags={tags}
        notes={[`Target ${run.target} after ${run.t} seconds.`]} />
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
  }} renderReasoning={() => <>
    <p>The frog never returns to a visited vertex, so the tree rooted at vertex 1 fixes every path.</p>
    <p>A vertex with children gives its probability away at the next second, while a leaf keeps it for the rest of the time.</p>
  </>} />
}
