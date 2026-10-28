import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no windows found.' },
    { id: 'scan', label: 'Scan ends', description: 'For each end, look for a target window that finishes here.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest total length, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'An object with arr (1 to 12 integers from 1 to 12) and target (1 to 12)',
  url: 'https://leetcode.com/problems/find-two-non-overlapping-sub-arrays-each-with-target-sum/',
  complexity: 'O(n) time with a hash map of prefix sums. The visualization caps arr at 12 entries.',
  examples: [
    { label: 'Example 1', input: '{"arr":[3,2,2,4,3],"target":3}' },
    { label: 'Example 2', input: '{"arr":[7,3,4,7],"target":7}' },
  ],
}

export default function TwoNonOverlappingTargetWindows() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="arr" length={run.input.arr.length} valueAt={index => run.input.arr[index]} active={step.index}
      roleAt={index => step.window && index >= step.window[0] && index <= step.window[1] ? 'window' : ''} />
    <output aria-label="Best total">{`Best total so far: ${step.best ?? '(none)'}`}</output>
  </>} renderReasoning={() => <>
    <p>A window sums to the target exactly when two prefix sums differ by the target, so a map of prefix sums finds each window ending at a position.</p>
    <p>The second window must end before the first one starts, so each new window is paired with the shortest window that finished earlier.</p>
  </>} />
}
