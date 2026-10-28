import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with an empty kept suffix.' },
    { id: 'scan', label: 'Keep bit', description: 'Keep this bit because the value still fits.' },
    { id: 'stop', label: 'Stop', description: 'This one bit would exceed k, so the scan ends.' },
    { id: 'done', label: 'Complete', description: 'Report the longest length.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON object {"s": binary string, "k": integer}',
  url: 'https://leetcode.com/problems/longest-binary-subsequence-less-than-or-equal-to-k/',
  complexity: 'O(n) time for the scan plus O(n) to count zeros. The visualization caps input at 20 bits.',
  examples: [
    { label: 'Example 1', input: '{"s": "1001010", "k": 5}' },
    { label: 'Example 2', input: '{"s": "00101001", "k": 1}' },
  ],
}

export default function LongestBinarySubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Bits" length={run.input.s.length} valueAt={i => run.input.s[i]} active={step.index}
      roleAt={i => (i >= run.input.s.length - step.kept ? 'kept' : '')} />
    <output aria-label="Scan state">{`Value ${step.value} of at most ${run.input.k}, kept length ${step.kept}`}</output>
  </>} renderReasoning={() => <>
    <p>Leading zeros add nothing to a value, so every zero to the left of the kept part is free to include.</p>
    <p>The kept part is the longest suffix whose binary value stays at most k. Extending it leftward only adds a larger place value, so the scan stops at the first one that does not fit.</p>
  </>} />
}
