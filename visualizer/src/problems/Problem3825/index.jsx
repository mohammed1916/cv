import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin with no subsequence.' },
    { id: 'end', label: 'Ending index', description: 'Extend every increasing subsequence that ends here.' },
    { id: 'done', label: 'Complete', description: 'Report the longest valid subsequence.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Numbers (JSON object with nums)',
  url: 'https://leetcode.com/problems/longest-strictly-increasing-subsequence-with-non-zero-bitwise-and/',
  complexity: 'O(n^2 * bits) time, since each index keeps at most one length per AND value. The visualization caps n at 10.',
  examples: [
    { label: 'Example 1', input: '{"nums":[5,4,7]}' },
    { label: 'Example 2', input: '{"nums":[2,3,6]}' },
    { label: 'Zero', input: '{"nums":[0,1]}' },
  ],
}

export default function LongestIncreasingWithNonZeroAnd() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    return <IndexedSequence label="Numbers" length={nums.length} valueAt={i => nums[i]} active={step.index}
      roleAt={i => (step.index >= 0 && i < step.index ? 'before' : '')} />
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p>Each index keeps, for every AND value, the longest strictly increasing subsequence ending there. Only the AND value matters for future extensions.</p>
  </>} />
}
