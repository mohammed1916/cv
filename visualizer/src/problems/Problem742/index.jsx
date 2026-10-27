import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Target', description: 'Begin at the node with value k.' },
    { id: 'expand', label: 'Expand', description: 'Queue the children and the parent of each non-leaf node.' },
    { id: 'found', label: 'Leaf', description: 'The first leaf dequeued is the closest.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Tree (JSON level order) and k',
  url: 'https://leetcode.com/problems/closest-leaf-in-a-binary-tree/',
  complexity: 'O(n) time and space. The visualization caps input at 30 nodes.',
  examples: [
    { label: 'Example 1', input: '{"arr":[1,3,2],"k":1}' },
    { label: 'Deeper leaf', input: '{"arr":[1,2,3,4,null,null,null,5],"k":2}' },
  ],
}

export default function ClosestLeaf() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    for (const id of step.visited) roles[id] = 'visited'
    roles[step.node] = step.phase === 'found' ? 'match' : 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} />
      <output aria-label="Queue">{`Queue: ${step.queue.length ? step.queue.join(', ') : 'empty'}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>A leaf's nearest neighbour is reached by walking up and then down, so the search must also move to parents. Treating parent links as edges makes the tree an ordinary undirected graph.</p>
    <p>Breadth-first search reaches nodes in order of distance, so the first leaf it dequeues is the closest.</p>
  </>} />
}
