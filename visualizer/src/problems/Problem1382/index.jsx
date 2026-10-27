import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import BinaryTreeLane from '../../components/shared/BinaryTreeLane'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with the input tree.' },
    { id: 'collect', label: 'Collect', description: 'The inorder walk gives the values in sorted order.' },
    { id: 'pick', label: 'Pick middle', description: 'The middle value of the current range becomes a root.' },
    { id: 'done', label: 'Complete', description: 'Report the balanced tree in level order.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with root (level-order array, a valid BST)',
  url: 'https://leetcode.com/problems/balance-a-binary-search-tree/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 10 nodes.',
  examples: [
    { label: 'Example 1', input: '{"root":[1,null,2,null,3,null,4]}' },
    { label: 'Already balanced', input: '{"root":[2,1,3]}' },
  ],
}

export default function BalanceBst() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <BinaryTreeLane title="Input tree" root={run.root} roles={{}} />
    <IndexedSequence label="Sorted values" length={run.values.length} valueAt={i => run.values[i]} active={step.mid}
      roleAt={i => (step.mid >= 0 && i >= step.low && i <= step.high ? 'range' : '')} />
    <output aria-label="Range">{step.mid >= 0 ? `Range ${step.low} to ${step.high}, root ${run.values[step.mid]}` : 'Sorted values are shown once collected.'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Choosing the middle of a sorted range as the root keeps the left and right halves within one level of each other.</p>
  </>} />
}
