import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { DPTable } from '../../components/shared/AlgorithmStatePrimitives'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'One way to be at index 0 before any step.' },
    { id: 'cell', label: 'Fill step', description: 'Each position sums the ways to arrive from itself and its two neighbours.' },
    { id: 'done', label: 'Complete', description: 'Report the ways to finish at index 0.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with steps and arr_len (JSON)',
  url: 'https://leetcode.com/problems/number-of-ways-to-stay-in-the-same-place-after-some-steps/',
  complexity: 'O(steps * arr_len) time and space. The visualization caps both inputs at 12.',
  examples: [
    { label: 'Example 1', input: '{"steps":3,"arr_len":2}' },
    { label: 'Example 2', input: '{"steps":4,"arr_len":2}' },
  ],
}

export default function StayInSamePlace() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <DPTable title="Ways by step (rows) and index (columns)" values={step.table}
      activeCell={step.position >= 0 ? { row: step.step, column: step.position } : null} />
    <output aria-label="Result">{step.total === null ? `Steps so far: ${step.step} of ${run.input.steps}` : `Answer: ${step.total}`}</output>
  </>} renderReasoning={() => <>
    <p>Each step, the walker moves left, right, or stays, and must remain inside the array. The ways to reach a position after a step come from the same position and its neighbours.</p>
    <p>The answer is the number of walks that finish at index 0 after exactly the given number of steps.</p>
  </>} />
}
