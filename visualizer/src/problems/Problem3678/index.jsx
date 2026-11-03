import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'average', label: 'Average', description: 'Compare the sum with the count.' },
    { id: 'check', label: 'Check', description: 'Test integers above the average in order.' },
    { id: 'done', label: 'Result', description: 'The first absent integer above the average.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers',
  url: 'https://leetcode.com/problems/smallest-absent-positive-greater-than-average/',
  complexity: 'O(n) time and O(n) space for the set. The candidate can pass at most n present values.',
  examples: [
    { label: 'Example', input: '[7,2,9]' },
    { label: 'Negatives', input: '[-4,1,1]' },
  ],
}

export default function SmallestAbsentAboveAverage() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={-1}
      roleAt={i => (step.candidate !== null && run.input.nums[i] === step.candidate ? 'match' : '')} />
    <output aria-label="Candidate check">{step.candidate === null ? 'Computing the average' : `candidate ${step.candidate} ${step.taken ? 'is present' : 'is absent'}`}</output>
  </>} renderReasoning={() => <>
    <p>The average splits the number line. Any integer above it is a candidate, and the smallest candidate missing from the list is the answer.</p>
    <p>Starting at the first integer above the average and stepping upward means no smaller valid integer is skipped.</p>
  </>} />
}
