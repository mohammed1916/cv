import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'search', label: 'Search range', description: 'Set the binary search range for k.' },
    { id: 'probe', label: 'Probe k', description: 'Count the operations for the middle k.' },
    { id: 'done', label: 'Complete', description: 'Report the smallest valid k.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/minimum-k-to-reduce-array-within-limit/',
  complexity: 'O(n log(max + n)) time. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[3,7,5]}' },
    { label: 'Example 2', input: '{"nums":[1]}' },
  ],
}

export default function MinimumKToReduceArrayWithinLimit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const k = step.k || 1
    return <IndexedSequence label="Operations per number" length={nums.length} valueAt={i => nums[i]} active={-1}
      roleAt={i => `needs ${Math.ceil(nums[i] / k)} at k = ${k}`} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Making a number non-positive by subtracting k takes ceil(x / k) operations. The condition holds for every k above some threshold, so binary search applies.</p>
  </>} />
}
