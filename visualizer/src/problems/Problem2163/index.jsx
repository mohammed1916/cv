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
  question: "Remove n numbers from an array of 3n values so that the difference between the first n remaining and the last n remaining is as small as possible.",
  approaches: [
    { name: "Prefix minimum and suffix maximum heaps", intuition: "For each split point, keep the n smallest values on the left and the n largest on the right using heaps.", time: "O(n log n)", space: "O(n)" },
  ],
  examples: [
    { label: 'Six values', input: '[7,9,5,8,1,3]' },
    { label: 'Nine values', input: '[10,2,8,6,3,9,1,4,5]' },
    { label: 'Three values', input: '[3,1,2]' },
    { label: 'Equal values', input: '[4,4,4,4,4,4]' },
    { label: 'Largest input, 18 values', input: '[100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000,100000,-100000]' },
    { label: 'Long run: 18 values', input: '[-13195,49407,-27748,-94073,-81341,-12667,-68415,-15319,47872,79539,20328,-28861,-63417,-65461,-85884,67080,67017,-13011]' },
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
