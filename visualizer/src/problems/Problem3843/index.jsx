import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'count', label: 'Count', description: 'Tally each value and how many values share each count.' },
    { id: 'scan', label: 'Scan', description: 'Check the next value in array order.' },
    { id: 'found', label: 'Found', description: 'This value has a count no other value shares.' },
    { id: 'done', label: 'Complete', description: 'Report the answer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON object with nums)',
  url: 'https://leetcode.com/problems/first-element-with-unique-frequency/',
  complexity: 'O(n) time and O(n) space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[20,10,30,30]}' },
    { label: 'Example 2', input: '{"nums":[20,20,10,30,30,30]}' },
    { label: 'No answer', input: '{"nums":[10,10,20,20]}' },
  ],
}

export default function FirstUniqueFrequency() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index} />
    <output aria-label="Answer">{step.result === null ? `Checking ${step.value ?? '-'}` : `Answer: ${step.result}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>The first table counts each value. The second table counts how many values share each count, so a value is a valid answer when its count appears exactly once in that second table.</p>
  </>} />
}
