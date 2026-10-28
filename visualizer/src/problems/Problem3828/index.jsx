import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'First end', description: 'Read the first element, the left endpoint.' },
    { id: 'ends', label: 'Last end', description: 'Read the last element, the right endpoint.' },
    { id: 'done', label: 'Complete', description: 'Keep the larger endpoint as the final element.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Game array (JSON object with nums)',
  url: 'https://leetcode.com/problems/final-element-after-subarray-deletions/',
  complexity: 'O(1) time and O(1) extra space. The visualization caps input at 30 values.',
  examples: [
    { label: 'Example 1', input: '{"nums":[1,5,2]}' },
    { label: 'Example 2', input: '{"nums":[3,7]}' },
  ],
}

export default function FinalElementAfterDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i === 0 || i === run.input.nums.length - 1 ? 'end' : '')} />
    <output aria-label="Result">{step.result === null ? 'Result pending' : `Final element: ${step.result}`}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Alice removes the middle in one move, which keeps both ends. Bob then removes any middle element that is still there, so only the two endpoints can end up as the final element.</p>
  </>} />
}
