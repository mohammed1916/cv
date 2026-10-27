import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Set the best sum to zero.' },
    { id: 'bst', label: 'Valid BST', description: 'Both children are BSTs and this value fits between them.' },
    { id: 'reject', label: 'Not a BST', description: 'This subtree cannot be a BST, so it contributes nothing.' },
    { id: 'done', label: 'Complete', description: 'Report the largest BST sum.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a level-order tree, for example {"tree":[1,4,3]}',
  url: 'https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/',
  complexity: 'O(n) time and O(h) stack space. The visualization caps input at 15 nodes.',
  examples: [
    { label: 'Example 1', input: '{"tree":[1,4,3,2,4,2,5,null,null,null,null,null,null,4,6]}' },
    { label: 'Example 2', input: '{"tree":[4,3,null,1,2]}' },
  ],
}

export default function MaximumSumBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    Object.entries(step.marks).forEach(([id, label]) => { roles[id] = label.startsWith('BST') ? 'visited' : 'pruned' })
    if (step.node !== null) roles[step.node] = 'active'
    return <>
      <BinaryTreeLane title="Tree" root={run.root} roles={roles} tags={step.marks} />
      <output aria-label="Best">{`Best BST sum: ${step.best}`}</output>
    </>
  }} renderReasoning={() => <>
    <p>Each subtree reports whether it is a BST, its smallest and largest values, and its sum. A node joins its children only when the left maximum and right minimum surround its value.</p>
    <p>Reporting an empty subtree as a BST with sum 0 lets leaves and one-sided nodes use the same rule.</p>
  </>} />
}
