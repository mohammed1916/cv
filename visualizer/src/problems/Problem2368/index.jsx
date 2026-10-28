import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import GraphTraversalView from '../../components/shared/GraphTraversalView'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at node 0 with restricted nodes blocked.' },
    { id: 'visit', label: 'Explore', description: 'Take the next node from the queue.' },
    { id: 'reach', label: 'Reach', description: 'Mark an unrestricted, unseen neighbour as reachable.' },
    { id: 'done', label: 'Count', description: 'Return the number of reachable nodes.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with n, edges and restricted (JSON)',
  url: 'https://leetcode.com/problems/reachable-nodes-with-restrictions/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 12 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"edges":[[0,1],[1,2],[3,1],[4,0],[0,5],[5,6]],"restricted":[4,5]}' },
    { label: 'Example 2', input: '{"n":7,"edges":[[0,1],[0,2],[0,5],[0,4],[3,2],[6,5]],"restricted":[4,2,1]}' },
  ],
}

export default function ReachableNodes() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const tags = Object.fromEntries(run.input.restricted.map(v => [v, 'blocked']))
    return <>
      <GraphTraversalView title="Tree (undirected)" n={run.input.n} edges={run.input.edges} current={step.current}
        neighbour={step.neighbour} visited={step.visited} frontier={step.frontier} done={[]} tags={tags} frontierTitle="Queue" />
      <output aria-label="Reach state">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Restricted nodes simply cannot be entered, so they cut the tree; everything beyond a cut is unreachable from node 0.</p>
    <p>A tree has no cycles, so each unrestricted node is reached exactly once and the count is the size of node 0's piece.</p>
  </>} />
}
