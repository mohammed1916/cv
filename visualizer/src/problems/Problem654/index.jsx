import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Whole array', description: 'Find the maximum of the full range.' },
    { id: 'pick', label: 'Pick maximum', description: 'Make it a node and recurse on each side.' },
    { id: 'done', label: 'Complete', description: 'Return the tree in level order.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Array nums (JSON, distinct values)',
  url: 'https://leetcode.com/problems/maximum-binary-tree/',
  complexity: 'O(n²) worst case for this straightforward scan (O(n) with a monotonic stack). O(n) space for the tree.',
  examples: [
    { label: 'Example', input: '[3,2,1,6,0,5]' },
    { label: 'Increasing', input: '[1,2,3]' },
    { label: 'Single', input: '[5]' },
  ],
}

export default function MaximumBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const roles = {}
    if (step.current !== null && step.current !== undefined) roles[step.current] = 'active'
    return <>
      <BinaryTreeLane title={step.phase === 'done' ? 'Maximum binary tree' : 'Tree so far'} root={run.root} roles={roles} />
      <output aria-label="Level order">[{(step.result ?? []).join(', ')}]</output>
      {step.range && <p>Current range: indices {step.range[0]}–{step.range[1]}</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Divide and conquer:</strong> the maximum splits the range into a left part and a right part, and both parts build their subtrees the same way.</p>
  </>} />
}
