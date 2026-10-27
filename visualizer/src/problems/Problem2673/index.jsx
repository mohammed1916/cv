import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Leaves', description: 'Leaves start with their own cost.' },
    { id: 'pair', label: 'Compare children', description: 'Look at the path costs of the two children.' },
    { id: 'balance', label: 'Raise cheaper side', description: 'Add the difference to make both children equal.' },
    { id: 'lift', label: 'Lift node', description: 'Set this node path cost to its cost plus the costlier child.' },
    { id: 'done', label: 'Complete', description: 'Report the total increments.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Perfect-style heap tree as JSON: n, cost',
  url: 'https://leetcode.com/problems/make-costs-of-paths-equal-in-a-binary-tree/',
  complexity: 'O(n) time and O(n) space. The visualization caps the tree at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"n":7,"cost":[1,5,2,2,3,3,1]}' },
    { label: 'Example 2', input: '{"n":3,"cost":[5,3,3]}' },
  ],
}

// Heap-numbered tree: node i has children 2i and 2i+1, matching the input's numbering.
function heapTree(n, cost) {
  const make = i => (i > n ? null : { id: i, value: `${cost[i - 1]}`, left: make(2 * i), right: make(2 * i + 1) })
  return make(1)
}

export default function EqualPathCosts() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.node !== null) roles[step.node] = 'active'
    if (step.left) roles[step.left] = 'visited'
    if (step.right) roles[step.right] = 'visited'
    const tags = {}
    step.path.forEach((value, id) => { if (id >= 1 && id <= run.input.n && step.path[id] !== run.input.cost[id - 1]) tags[id] = `path ${value}` })
    return <>
      <BinaryTreeLane title="Heap-numbered tree (value is node cost)" root={heapTree(run.input.n, run.input.cost)} roles={roles} tags={tags} />
      <output aria-label="Increments">{`Increments so far: ${step.total}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Paths from a node down to its leaves share everything below it, so the subtrees beneath a node can be balanced independently.</p>
    <p>Raising the cheaper child to the costlier one is forced, and it never hurts the paths above, so the greedy total is minimal.</p>
  </>} />
}
