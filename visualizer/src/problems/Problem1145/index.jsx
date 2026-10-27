import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count', description: 'Count all nodes; Player 1 colors x.' },
    { id: 'locate', label: 'Split', description: 'Node x divides the rest of the tree into three regions.' },
    { id: 'compare', label: 'Compare', description: 'The largest region decides whether Player 2 can win.' },
    { id: 'done', label: 'Complete', description: 'Report the result.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a level-order tree and x, for example {"tree":[1,2,3],"x":1}',
  url: 'https://leetcode.com/problems/binary-tree-coloring-game/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,2,3,4,5,6,7,8,9,10,11],"x":3}' },
    { label: 'Small tree', input: '{"tree":[1,2,3],"x":1}' },
  ],
}

export default function BinaryTreeColoringGame() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    Object.entries(step.regions || {}).forEach(([name, ids]) => {
      const role = name === 'left' ? 'visited' : name === 'right' ? 'match' : 'pruned'
      ids.forEach(id => { roles[id] = role })
    })
    if (step.node !== null) roles[step.node] = 'active'
    const sizes = step.sizes
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={step.node !== null ? { [step.node]: 'x' } : {}} />
      <output aria-label="Regions">{sizes ? `Left ${sizes.left} · Right ${sizes.right} · Parent side ${sizes.parent}` : 'Regions appear once x is found.'}</output>
    </>
  }} renderReasoning={() => <>
    <p>Player 1 colors x. Player 2 must take a neighbor of x, and each player then grows only from nodes they own, so the tree behaves as three separate regions.</p>
    <p>The second player wins if the largest region holds more than half of the nodes, since that region can be taken whole.</p>
  </>} />
}
