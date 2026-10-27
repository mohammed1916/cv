import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Plan: parent links, then BFS.' },
    { id: 'parent', label: 'Record parent', description: 'DFS stores each node\'s parent.' },
    { id: 'seed', label: 'Seed BFS', description: 'Start the BFS at the target.' },
    { id: 'expand', label: 'Expand node', description: 'Visit left, right and parent neighbours.' },
    { id: 'level', label: 'Level done', description: 'One more unit of distance covered.' },
    { id: 'done', label: 'Complete', description: 'Nodes at distance k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object {tree, target, k} (JSON, level-order tree with null, up to 30 nodes)',
  url: 'https://leetcode.com/problems/all-nodes-distance-k-in-binary-tree/',
  complexity: 'O(n) time and space: one DFS for parents and one BFS over at most n nodes.',
  examples: [
    { label: 'Official example', input: '{"tree":[3,5,1,6,2,0,8,null,null,7,4],"target":5,"k":2}' },
    { label: 'Single node, k=0', input: '{"tree":[1],"target":1,"k":0}' },
    { label: 'Distance beyond tree', input: '{"tree":[1,2,3,4],"target":4,"k":5}' },
    { label: 'Climb through parent', input: '{"tree":[0,1,null,3,2],"target":2,"k":1}' },
  ],
}

export default function DistanceK() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    if (step.phase === 'parent') for (const id of step.parentDone ?? []) roles[id] = 'visited'
    else {
      for (const id of step.seen ?? []) roles[id] = 'visited'
      for (const id of step.queue ?? []) roles[id] = 'match'
      for (const [id, d] of Object.entries(step.dists ?? {})) tags[id] = `d${d}`
    }
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title="Tree (target distances shown above nodes)" root={run.root} roles={roles} tags={tags} />
      <output aria-label="Frontier">Current distance: {step.dist ?? 0}; frontier: {(step.queue ?? []).length}</output>
      {step.phase === 'done' && <output aria-label="Answer">Answer: [{run.result.join(', ')}]</output>}
    </>
  }} renderReasoning={({ run }) => <>
    <p>Target {run.input.target}, k = {run.input.k}.</p>
    <p><strong>Why parent links:</strong> the shortest path to a node may go up before going down. Treating the tree as an undirected graph needs the missing upward edge.</p>
    <p><strong>Why BFS:</strong> each level is one more edge, so after k levels the frontier is exactly the nodes at distance k; a seen set prevents going back along the edge just used.</p>
  </>} />
}
