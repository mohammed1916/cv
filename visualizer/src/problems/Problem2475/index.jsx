import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Count how many times each value appears.' },
    { id: 'group', label: 'Middle group', description: 'Use this value group as the middle of the triplet.' },
    { id: 'done', label: 'Complete', description: 'Report the number of unequal triplets.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Integers 1 to 10 as a JSON array',
  url: 'https://leetcode.com/problems/number-of-unequal-triplets-in-array/',
  complexity: 'O(n) time for the grouped form. The visualization caps input at 12 entries.',
  examples: [
    { label: 'Example 1', input: '[4,4,2,4,3]' },
    { label: 'Example 2', input: '[1,1,1,1,1]' },
  ],
}

export default function UnequalTriplets() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]} roleAt={i => (run.input[i] === step.value ? 'middle' : '')} />
    <output aria-label="Triplet split">{step.value === null ? `Entries in the array: ${run.input.length}` : `Value ${step.value}: ${step.before} before, ${step.group} copies, ${step.after} after`}</output>
    <output aria-label="Triplets so far">{`Triplets so far: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A triplet with three different values uses three different groups, so each one can be counted once by its middle group.</p>
    <p>For a middle group, every entry before it pairs with every entry after it, and any one of the group&apos;s own copies can be the middle entry.</p>
  </>} />
}
