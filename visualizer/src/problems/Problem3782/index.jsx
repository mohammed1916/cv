import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Write the integers 1 through n.' },
    { id: 'left', label: 'Delete from left', description: 'Keep the values at even positions from the left.' },
    { id: 'right', label: 'Delete from right', description: 'Keep the values at even distances from the right.' },
    { id: 'done', label: 'Complete', description: 'Report the last remaining integer.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Count (JSON object with n)',
  url: 'https://leetcode.com/problems/last-remaining-integer-after-alternating-deletion-operations/',
  complexity: 'O(n) time for simulation in this visualization. The problem allows n up to 10^15, which needs the reverse-tracing method. The visualization caps n at 200.',
  examples: [
    { label: 'Example 1', input: '{"n":8}' },
    { label: 'Example 2', input: '{"n":5}' },
  ],
}

export default function LastRemainingIntegerAfterDeletions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => (
    <IndexedSequence label="Remaining values" length={step.values.length} valueAt={i => step.values[i]} active={-1} />
  )} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each round keeps about half the values, so the simulation takes O(log n) rounds.</p>
  </>} />
}
