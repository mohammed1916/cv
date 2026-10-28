import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import FrequencyCountTable from '../../components/shared/FrequencyCountTable'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Read the array and prepare to count.' },
    { id: 'count', label: 'Count values', description: 'Tally each value as it is read.' },
    { id: 'check', label: 'Test counts', description: 'Check each frequency for primality.' },
    { id: 'found', label: 'Prime found', description: 'A prime frequency answers true.' },
    { id: 'done', label: 'Complete', description: 'No prime frequency was found.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array nums of integers 1 to 100 (JSON object)',
  url: 'https://leetcode.com/problems/check-if-any-element-has-prime-frequency/',
  complexity: 'O(n + m * sqrt(n)) time, where m is the number of distinct values. The visualization caps the array at 30 values.',
  examples: [
    { label: 'Triple value', input: '{"nums":[1,2,2,2]}' },
    { label: 'No prime count', input: '{"nums":[1,2,3]}' },
  ],
}

export default function PrimeFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    return <>
      <IndexedSequence label="Array" length={nums.length} valueAt={i => nums[i]} active={step.index}
        roleAt={i => (step.index >= 0 && i <= step.index ? 'seen' : '')} />
      <FrequencyCountTable title="Frequencies" entries={step.counts} active={step.key} />
      <output aria-label="Current check">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>Only the frequencies matter, so each distinct value is counted once and its count is tested for primality.</p>
    <p>Prime counts start at 2, so a value that appears once never counts as a prime frequency.</p>
  </>} />
}
