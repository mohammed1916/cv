import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'one', label: 'Place a one', description: 'Score each index the one can reach.' },
    { id: 'done', label: 'Complete', description: 'Report the best total score.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Values and bits (JSON object with nums and s)',
  url: 'https://leetcode.com/problems/maximum-score-after-binary-swaps/',
  complexity: 'O(n^2) time in this visualization. The visualization caps n at 12.',
  examples: [
    { label: 'Example 1', input: '{"nums":[2,1,5,2,3],"s":"01010"}' },
    { label: 'No ones', input: '{"nums":[4,7,2,9],"s":"0000"}' },
  ],
}

export default function MaximumScoreAfterBinarySwaps() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, s } = run.input
    const roleAt = i => (s[i] === '1' ? 'one' : '')
    return <IndexedSequence label="Values" length={nums.length} valueAt={i => nums[i]} active={step.position >= 0 ? step.position : -1} roleAt={roleAt} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Ones keep their order and can only move left into zeros, so each one has a range of reachable indexes.</p>
  </>} />
}
