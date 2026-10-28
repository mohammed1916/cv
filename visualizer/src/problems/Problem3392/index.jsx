import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Count zero', description: 'Start with no matching windows.' },
    { id: 'check', label: 'Check window', description: 'Test the three values at this start index.' },
    { id: 'done', label: 'Return', description: 'Return the number of matching windows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array (JSON array of 3 to 12 integers from -100 to 100)',
  url: 'https://leetcode.com/problems/count-subarrays-of-length-three-with-a-condition/',
  complexity: 'O(n) time and O(1) extra space.',
  examples: [
    { label: 'Example 1', input: '[1,2,1,4,1]' },
    { label: 'Example 2', input: '[1,1,1]' },
  ],
}

export default function CountWindows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Array" length={run.input.length} valueAt={i => run.input[i]}
      active={step.start >= 0 ? step.start + 1 : -1}
      roleAt={i => (step.start >= 0 && i >= step.start && i <= step.start + 2 ? 'in window' : '')} />
    <output aria-label="Window state">{`${step.message} Matches so far: ${step.count}`}</output>
  </>} renderReasoning={() => <>
    <p>Each subarray of length three is judged only by its first, middle and last values, so a window slides one index at a time.</p>
    <p>The condition is first plus third equals half the middle. Doubling both sides keeps the comparison in whole numbers.</p>
  </>} />
}
