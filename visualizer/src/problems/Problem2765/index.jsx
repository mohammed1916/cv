import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin where the next value is one larger.' },
    { id: 'extend', label: 'Extend', description: 'Keep adding values while the rise and fall alternate by one.' },
    { id: 'stop', label: 'Break', description: 'The pattern fails, so this start is finished.' },
    { id: 'done', label: 'Complete', description: 'Report the longest run.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums (JSON)',
  url: 'https://leetcode.com/problems/longest-alternating-subarray/',
  complexity: 'O(n^2) time and O(1) space for this scan. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,3,4,3,4]}' },
    { label: 'Example 2', input: '{"nums":[4,5,6]}' },
  ],
}

export default function LongestAlternatingSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="nums" length={run.input.nums.length} valueAt={i => run.input.nums[i]} active={step.end}
      roleAt={i => (step.start >= 0 && i >= step.start && i <= step.end ? 'window' : '')} />
    <output aria-label="Best">{`Best so far: ${step.best}`}</output>
  </>} renderReasoning={() => <>
    <p>A run must start with a rise of exactly 1, then alternate between falls and rises of exactly 1.</p>
    <p>Each start is extended while the pattern holds, and the longest length is kept.</p>
  </>} />
}
