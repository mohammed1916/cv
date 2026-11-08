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
    { label: 'Own case 1', input: '{"nums":[3,2,5,1,2],"s":"01010"}' },
    { label: 'No ones', input: '{"nums":[4,7,2,9],"s":"0000"}' },
    { label: "Single value", input: "{\"nums\":[5],\"s\":\"1\"}" },
    { label: "Equal values", input: "{\"nums\":[3,3,3,3],\"s\":\"0101\"}" },
    { label: "Extremes, all ones at length 12", input: "{\"nums\":[9,1,9,1,9,1,9,1,9,1,9,1],\"s\":\"111111111111\"}" },
    { label: "Long run: 12 values", input: "{\"nums\":[3,6,2,9,8,6,4,1,9,6,2,9],\"s\":\"001011001100\"}" },
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
