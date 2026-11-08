import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No good subsequence has been counted yet.' },
    { id: 'extend', label: 'Extend', description: 'Count the good subsequences that end at this element.' },
    { id: 'done', label: 'Complete', description: 'Report the sum of all good subsequences.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/sum-of-good-subsequences/',
  complexity: 'O(n) expected time with hash maps. The visualization caps the array at 12 values up to 1000.',
  examples: [
    { label: 'Own case 1', input: '[2,3,2]' },
    { label: 'Own case 2', input: '[4,5,6]' },
    { label: 'Single value', input: '[1]' },
    { label: 'Equal values', input: '[7,7,7]' },
    { label: 'Largest allowed values', input: '[1000,1,1000]' },
    { label: 'Long run: 12 values', input: '[392,92,388,742,694,565,419,86,84,959,327,626]' },
  ],
}

export default function SumOfGoodSubsequences() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.length} valueAt={index => run.input[index]} active={step.index < run.input.length ? step.index : -1}
      roleAt={index => (index < step.index ? 'seen' : '')} />
    <output aria-label="Total">{step.index >= 0 && step.index < run.input.length ? `Element ${step.value} adds ${step.weight} to the total ${step.total}` : `Total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>A good subsequence has neighbours that differ by exactly one, so a value x can only follow a value x minus one or x plus one.</p>
    <p>For each value, the table keeps how many good subsequences end there and their total sum. Each new element adds its own subsequence and extends the two neighbouring values.</p>
  </>} />
}
