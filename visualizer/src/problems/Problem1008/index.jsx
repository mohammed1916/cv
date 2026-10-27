import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Root', description: 'The first preorder value becomes the root.' },
    { id: 'place', label: 'Place', description: 'Create a node for the next value inside its bounds.' },
    { id: 'skip', label: 'Empty subtree', description: 'The next value does not fit these bounds, so this subtree is empty.' },
    { id: 'done', label: 'Complete', description: 'Serialize the tree in level order.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Preorder traversal (JSON object with preorder)',
  url: 'https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/',
  complexity: 'O(n) time and O(h) recursion space. The visualization caps input at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"preorder":[8,5,1,7,10,12]}' },
    { label: 'Two values', input: '{"preorder":[1,3]}' },
    { label: 'Trimmed', input: '{"preorder":[5,3,2,6]}' },
  ],
}

export default function BstFromPreorder() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Preorder values" length={run.input.preorder.length} valueAt={i => run.input.preorder[i]} active={step.cursor}
      roleAt={i => (i < step.consumed ? 'read' : '')} />
    <BinaryTreeLane title="Tree built so far" root={step.tree}
      roles={step.node === null ? {} : { [step.node]: 'active' }}
      tags={step.node === null ? {} : { [step.node]: `(${step.low}, ${step.high})` }} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each node's bounds come from its ancestors: a left child must be below its parent, and a right child above it. A value outside the bounds ends that subtree, and the same value is tried again one level up.</p>
  </>} />
}
