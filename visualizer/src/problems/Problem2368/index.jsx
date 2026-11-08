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
    { label: 'Restricted leaves', input: '{"n":6,"edges":[[0,1],[1,2],[1,3],[3,4],[0,5]],"restricted":[2,4]}' },
    { label: 'Path with one restriction', input: '{"n":5,"edges":[[4,0],[0,1],[1,2],[2,3]],"restricted":[3]}' },
    { label: 'Two nodes, one restricted', input: '{"n":2,"edges":[[0,1]],"restricted":[1]}' },
    { label: 'No restricted nodes', input: '{"n":4,"edges":[[0,1],[0,2],[0,3]],"restricted":[]}' },
    { label: 'Path of 12 nodes', input: '{"n":12,"edges":[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]],"restricted":[1]}' },
    { label: 'Long run: 12 nodes', input: '{"n":12,"edges":[[0,1],[1,2],[0,3],[1,4],[0,5],[1,6],[4,7],[0,8],[6,9],[0,10],[4,11]],"restricted":[5,9,11]}' },
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
