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
    { label: 'Four values, k four', input: '{"nums":[3,8,1,6],"k":4}' },
    { label: 'Single value at limit', input: '{"nums":[10],"k":10}' },
    { label: 'Single value', input: '{"nums":[7],"k":1}' },
    { label: 'Equal values tie', input: '{"nums":[3,3,3,3],"k":3}' },
    { label: 'Largest values allowed', input: '{"nums":[100,100,100],"k":100}' },
    { label: 'Long run: 12 values', input: '{"nums":[28,67,10,9,16,79,14,21,28,99,30,69],"k":5}' },
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
