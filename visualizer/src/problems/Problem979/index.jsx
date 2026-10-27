import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the leaves.' },
    { id: 'visit', label: 'Surplus', description: 'Coins that must cross each edge above this node.' },
    { id: 'done', label: 'Complete', description: 'Report the total moves.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Coins per node (JSON level order)',
  url: 'https://leetcode.com/problems/distribute-coins-in-binary-tree/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '[3,0,0]' },
    { label: 'Example 2', input: '[0,3,0]' },
  ],
}

export default function DistributeCoins() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    const tags = {}
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={tags} note={`moves: ${step.moves}`} />
      <output aria-label="Moves">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Consider the edge above a node. If the subtree below it has a surplus of coins, that surplus must cross the edge; a deficit must be filled from above. Either way, the edge is crossed |surplus| times.</p>
    <p>Summing |surplus| over all edges gives the minimum moves.</p>
  </>} />
}
