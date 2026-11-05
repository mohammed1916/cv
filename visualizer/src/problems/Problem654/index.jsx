import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'range', label: 'Pick the maximum', description: 'In the current range, the largest value becomes the subtree root.' },
    { id: 'done', label: 'Complete', description: 'Every range has produced its root.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Distinct integers (JSON array)',
  url: 'https://leetcode.com/problems/maximum-binary-tree/',
  complexity: 'O(n²) time in the worst case (a sorted array), O(n log n) on average, and O(n) space for the tree.',
  examples: [
    { label: 'Mixed', input: '[5,1,4,2]' },
    { label: 'Descending', input: '[9,8,7]' },
    { label: 'Pair', input: '[2,9]' },
  ],
}

export default function MaximumBinaryTree() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const lo = step.lo ?? 0
    const hi = step.hi ?? run.input.length - 1
    return <>
      <IndexedSequence label="Input values" length={run.input.length} active={step.best ?? -1}
        valueAt={i => run.input[i]}
        roleAt={i => (i === step.best ? 'max' : i === lo && i === hi ? 'lo = hi' : i === lo ? 'lo' : i === hi ? 'hi' : i >= lo && i <= hi ? 'range' : '')} />
      {step.phase === 'done'
        ? <BinaryTreeLane title="Maximum binary tree" root={run.root} note="final tree" />
        : <p>The tree grows as each range picks its maximum.</p>}
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why the maximum:</strong> the largest value cannot sit below any other node, so it must be the root of its range.</p>
  </>} />
}
