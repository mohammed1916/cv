import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'setup', label: 'Start', description: 'Set the best value to zero.' },
    { id: 'extend', label: 'Extend', description: 'Add the next value to the window.' },
    { id: 'stop', label: 'Stop', description: 'The range is too wide for this start.' },
    { id: 'record', label: 'Record', description: 'Keep the largest XOR seen.' },
    { id: 'done', label: 'Result', description: 'Return the best value.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k',
  url: 'https://leetcode.com/problems/maximum-subarray-xor-with-bounded-range/',
  complexity: 'The inner loop stops early once the range exceeds k. The visual caps the array at 12 values.',
  examples: [
    { label: 'Example', input: '{"nums":[3,6,1,4],"k":3}' },
    { label: 'Tight range', input: '{"nums":[5,5,9,5],"k":0}' },
  ],
}

export default function MaximumSubarrayXorWithBoundedRange() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length}
      valueAt={i => run.input.nums[i]} active={step.window ? step.window[1] : -1}
      roleAt={i => (step.window && i >= step.window[0] && i <= step.window[1] ? 'window' : '')} />
    <output aria-label="Window state">{step.window
      ? `Window ${step.window[0]} to ${step.window[1]}: range ${step.hi - step.lo}, XOR ${step.x}, best ${step.best}`
      : `Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A subarray is allowed while its largest and smallest values differ by at most k.</p>
    <p>Extending a window to the right never shrinks its range, so once a window is too wide, every longer window from the same start is too wide too.</p>
  </>} />
}
