import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Empty prefix', description: 'Zero characters need zero pieces.' },
    { id: 'piece', label: 'Beautiful piece', description: 'A piece without a leading zero that is a power of 5 extends the best count.' },
    { id: 'done', label: 'Complete', description: 'Report the fewest pieces, or -1.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a binary string s (JSON)',
  url: 'https://leetcode.com/problems/partition-string-into-minimum-beautiful-substrings/',
  complexity: 'O(n^2) substring checks, each in O(n) time. The visualization caps s at 15 characters.',
  examples: [
    { label: 'Example 1', input: '{"s":"1011"}' },
    { label: 'Example 2', input: '{"s":"111"}' },
  ],
}

export default function MinimumBeautifulSubstrings() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <IndexedSequence label="Fewest pieces ending at each position (null = unset)" length={step.dp.length} valueAt={i => (step.dp[i] === null ? '-' : step.dp[i])}
      active={step.end} roleAt={i => (step.start >= 0 && i === step.start ? 'start' : '')} />
    <output aria-label="Piece">{step.start >= 0 ? `Piece ${run.input.s.slice(step.start, step.end)} from ${step.start} to ${step.end}` : `String ${run.input.s}`}</output>
  </>} renderReasoning={() => <>
    <p>A piece is beautiful when its binary value is a power of 5 and it does not start with a zero. Powers of 5 are sparse, so the check is quick.</p>
    <p>dp[i] is the fewest beautiful pieces covering the first i characters, which lets each position reuse the best earlier answer.</p>
  </>} />
}
