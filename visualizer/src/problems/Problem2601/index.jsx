import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'No previous value yet.' },
    { id: 'check', label: 'Check', description: 'Find the room above the previous value.' },
    { id: 'subtract', label: 'Subtract prime', description: 'Take the largest prime that keeps the value above the previous one.' },
    { id: 'keep', label: 'Keep', description: 'Leave the value unchanged.' },
    { id: 'fail', label: 'Fail', description: 'The value cannot exceed its predecessor.' },
    { id: 'done', label: 'Result', description: 'Report whether the array can be made increasing.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (integers 1 to 50, JSON)',
  url: 'https://leetcode.com/problems/prime-subtraction-operation/',
  complexity: 'O(n * sqrt(V)) time, O(1) extra space. The visualization caps the array at 8 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[4,9,6,10]}' },
    { label: 'Example 3', input: '{"nums":[5,8,3]}' },
  ],
}

export default function PrimeSubtractionOperation() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i < run.input.nums.length && step.value !== null && i === step.index ? 'new value ' + step.value : '')} />
    <output aria-label="Previous value">{`Previous value: ${step.previous}${step.prime ? `, prime subtracted: ${step.prime}` : ''}`}</output>
  </>} renderReasoning={() => <>
    <p>Lowering a value as far as allowed leaves the most room for the values after it.</p>
    <p>The largest prime that keeps the value above its predecessor gives that lowest safe result, so the greedy choice is optimal.</p>
  </>} />
}
