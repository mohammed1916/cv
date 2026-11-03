import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'range', label: 'Range', description: 'Take the next query range.' },
    { id: 'digits', label: 'Digits', description: 'Count the base-4 digits of each value in the range.' },
    { id: 'bound', label: 'Bound', description: 'Combine the total with the smallest value’s own count.' },
    { id: 'done', label: 'Result', description: 'Sum the per-range answers.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a ranges list of [l, r] pairs',
  url: 'https://leetcode.com/problems/minimum-operations-to-make-array-elements-zero/',
  complexity: 'O(sum of range lengths * log4(max value)) time for this visualizer, with O(1) extra space per range.',
  examples: [
    { label: 'Example', input: '{"ranges":[[3,7],[10,12]]}' },
    { label: 'Single range', input: '{"ranges":[[1,5]]}' },
  ],
}

export default function MinimumOperationsToMakeArrayElementsZero() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Values in this range" length={Math.max(1, step.r - step.l + 1)} valueAt={i => step.l + i}
      active={step.x >= 0 ? step.x - step.l : -1} roleAt={i => (step.l + i === step.l ? 'low' : '')} />
    <output aria-label="Range state">{step.ops !== null
      ? `Range [${step.l}, ${step.r}]: total digits ${step.total}, operations ${step.ops}`
      : step.x >= 0 ? `digits4(${step.x}) = running total ${step.total}` : `Answer so far ${step.answer}`}</output>
  </>} renderReasoning={() => <>
    <p>Each value is shrunk by repeated division by four, so it has a fixed number of base-4 digits. An operation can remove two of those steps at once.</p>
    <p>The smallest value in the range can never be paired more cheaply than its own count, so the range answer is the larger of that count and half the total, rounded up.</p>
  </>} />
}
