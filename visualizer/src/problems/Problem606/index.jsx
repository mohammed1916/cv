import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'Start the string with the root value.' },
    { id: 'write', label: 'Write node', description: 'Append a value and its child groups.' },
    { id: 'done', label: 'Complete', description: 'Return the string.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Tree (LeetCode level-order JSON array)',
  url: 'https://leetcode.com/problems/construct-string-from-binary-tree/',
  complexity: 'O(n) time for n nodes, O(h) recursion depth, and O(n) output length.',
  examples: [
    { label: 'Left-heavy', input: '[1,2,3,4]' },
    { label: 'Gap on the left', input: '[1,2,3,null,4]' },
    { label: 'Single node', input: '[1]' },
  ],
}

export default function StringFromTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Tree" root={run.root} roles={step.current !== null && step.current !== undefined ? { [step.current]: 'active' } : {}} />
    <output aria-label="Built string">{step.text || '(empty)'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Omitted parentheses:</strong> an empty left group is written as "()" only when a right child exists, which keeps the mapping back to the tree unique.</p>
  </>} />
}
