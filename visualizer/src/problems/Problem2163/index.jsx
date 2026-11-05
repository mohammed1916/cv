import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import HeapView from '../../components/shared/HeapView'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2163',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'Integer array of length 3n as JSON',
  url: 'https://leetcode.com/problems/minimum-difference-in-sums-after-removal-of-elements/',
  complexity: 'O(n log n) time with two heaps over the array; O(n) space.',
  examples: [
    { label: 'Six values', input: '[7,9,5,8,1,3]' },
    { label: 'Nine values', input: '[10,2,8,6,3,9,1,4,5]' },
  ],
}

export default function Problem2163Visualizer() {
  return (
    <AlgorithmWorkspace
      definition={definition}
      renderVisual={({ run, step }) => (
        <>
          <IndexedSequence label="Input (split point k marks the boundary)" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.k ?? -1} roleAt={i => (step.k !== null && step.k !== undefined && i < step.k ? 'left part' : 'right part')} />
          <HeapView title={step.phase === 'suffix' ? 'Right heap (keeps the largest, pops the smallest)' : 'Left heap (keeps the smallest, pops the largest)'} items={step.heap} order={step.phase === 'suffix' ? 'min' : 'max'} ops={[]} />
        </>
      )}
      renderReasoning={({ step }) => <p>{step.message}</p>}
    />
  )
}
