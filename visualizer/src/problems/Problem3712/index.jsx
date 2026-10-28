import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with empty counts.' },
    { id: 'count', label: 'Count', description: 'Add each value to its count.' },
    { id: 'add', label: 'Add', description: 'Keep a value whose count is a multiple of k.' },
    { id: 'skip', label: 'Skip', description: 'Ignore a value whose count is not a multiple of k.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object with nums and k, for example {"nums":[1,2,2,3],"k":2}',
  url: 'https://leetcode.com/problems/sum-of-elements-with-frequency-divisible-by-k/',
  complexity: 'O(n) time and O(n) space. The visualization caps the array at 12 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,2,2,3,3,3,3,4],"k":2}' },
    { label: 'Example 3', input: '{"nums":[4,4,4,1,2,3],"k":3}' },
  ],
}

export default function SumFrequencyDivisible() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={index => run.input.nums[index]} active={step.index} />
    <output aria-label="Total">{`k = ${run.input.k}. Current value ${step.value ?? '-'} with count ${step.count}. Total: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Only the frequency of each value matters, so count each value once with a map.</p>
    <p>A value contributes all of its occurrences when its count is divisible by k.</p>
  </>} />
}
