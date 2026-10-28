import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'sort', label: 'Sort', description: 'Sort a copy of the numbers.' },
    { id: 'step', label: 'Two pointers', description: 'Compare the sum at the two pointers with the limit.' },
    { id: 'done', label: 'Complete', description: 'Report the number of fair pairs.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, lower and upper (JSON)',
  url: 'https://leetcode.com/problems/count-the-number-of-fair-pairs/',
  complexity: 'O(n log n) time for the sort and O(n) for each two-pointer pass.',
  examples: [
    { label: 'Example 1', input: '{"nums":[0,1,7,4,4,5],"lower":3,"upper":6}' },
    { label: 'Example 2', input: '{"nums":[1,7,9,2,5],"lower":11,"upper":11}' },
  ],
}

export default function FairPairs() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Sorted numbers" length={run.input.nums.length} active={step.i}
      valueAt={index => step.sorted[index]}
      roleAt={index => (index === step.j ? 'right pointer' : '')} />
    <output aria-label="Pointer state">{step.sum === null ? `Sorted; target range ${run.input.lower} to ${run.input.upper}` : `${step.pass} pass: sum ${step.sum} against ${step.limit}, count ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Pairs with sum in the range are those with sum at most upper, minus those with sum at most lower minus one.</p>
    <p>On sorted values, one pointer pair counts every fitting pair in linear time.</p>
  </>} />
}
