import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set up distance tables for both starts.' },
    { id: 'walk', label: 'Walk', description: 'Follow each node’s single outgoing edge and record the steps.' },
    { id: 'compare', label: 'Compare', description: 'Keep the shared node with the smallest farther distance.' },
    { id: 'done', label: 'Complete', description: 'Report the closest shared node, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Edges and two start nodes as JSON, e.g. {"edges": [2,2,3,-1], "first": 0, "second": 1}',
  url: 'https://leetcode.com/problems/find-closest-node-to-given-two-nodes/',
  complexity: 'O(n) time and O(n) space, since each node has one outgoing edge.',
  examples: [
    { label: 'Example 1', input: '{"edges": [2,2,3,-1], "first": 0, "second": 1}' },
    { label: 'Example 2', input: '{"edges": [1,2,-1], "first": 0, "second": 2}' },
  ],
}

export default function ClosestSharedNode() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const fromFirst = step.fromFirst
    const fromSecond = step.fromSecond
    return <>
      <IndexedSequence label="Outgoing edge of each node" length={run.input.edges.length} valueAt={i => run.input.edges[i]} active={step.node ?? -1} />
      <table aria-label="Steps from each start">
        <thead><tr><th>Node</th><th>From first</th><th>From second</th></tr></thead>
        <tbody>{run.input.edges.map((_, node) => (
          <tr key={node} className={node === step.best ? 'is-current' : ''}>
            <td>{node}</td><td>{fromFirst[node] < 0 ? '-' : fromFirst[node]}</td><td>{fromSecond[node] < 0 ? '-' : fromSecond[node]}</td>
          </tr>
        ))}</tbody>
      </table>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => (
    <>
      <p>With one outgoing edge per node, the nodes reached from a start form a single path, so each distance is found by one walk.</p>
      <p>A shared node is judged by the larger of its two distances, because the meeting point must be reachable from both starts in that many steps.</p>
    </>
  )} />
}
