import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no best range and a total of 0.' },
    { id: 'range', label: 'Digit range', description: 'Find the largest digit minus the smallest digit.' },
    { id: 'reset', label: 'New maximum', description: 'A larger range replaces the total.' },
    { id: 'add', label: 'Tie', description: 'An equal range adds to the total.' },
    { id: 'skip', label: 'Skip', description: 'A smaller range changes nothing.' },
    { id: 'done', label: 'Complete', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/sum-of-integers-with-maximum-digit-range/',
  complexity: 'O(n log M) time and O(1) extra space, where M is the largest number. The visualization caps input at 12 numbers.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5724,111,350]}' },
    { label: 'Example 2', input: '{"nums":[90,900]}' },
  ],
}

export default function SumMaximumDigitRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Numbers" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.index}
      roleAt={i => (i < step.index ? 'seen' : '')} />
    <output aria-label="Running total">{`Best range ${step.best < 0 ? '(none)' : step.best}, total ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each number has a digit range, the largest digit minus the smallest. Only numbers that reach the largest range count.</p>
    <p>A new larger range restarts the total, and an equal range adds to it.</p>
  </>} />
}
