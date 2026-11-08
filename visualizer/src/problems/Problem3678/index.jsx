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
    { label: 'Single value', input: '[0]' },
    { label: 'Equal values', input: '[4,4,4,-4]' },
    { label: 'Extreme values', input: '[-100,100,-100,100]' },
    { label: 'Long run: 100 values', input: '[-23,-93,-62,24,-89,-2,-22,38,34,73,75,43,-79,55,-41,76,-98,-34,71,-36,48,0,40,82,-73,-9,-64,-59,22,-48,-66,-73,59,43,-33,58,24,-83,-50,-85,-92,-69,20,24,96,39,14,73,-13,-21,-27,-61,-14,64,-92,-88,-47,-91,-37,82,-17,-26,82,-32,33,-7,27,50,30,-96,-9,-52,60,3,45,14,64,-85,31,-44,65,81,-87,100,14,-97,-47,-47,-22,28,49,19,70,69,61,70,85,-86,-71,6]' },
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
