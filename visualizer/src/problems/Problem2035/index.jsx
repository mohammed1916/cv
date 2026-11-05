import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '2035',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Even-length integer array (JSON)',
  url: 'https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/',
  complexity: 'O(2^n * n) subset sums per half, then O(2^n * log 2^n) for the closest-partner search (n = half length).',
  examples: [
    { label: 'Four values', input: '[5,1,4,2]' },
    { label: 'Negatives', input: '[-7,3,2,-1,6,4]' },
    { label: 'Pair', input: '[10,-10]' },
  ],
}

export default function PartitionArrayMinimizeSumDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { left, right, total, c, best, bestPair } = step.snapshot
    return <>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div aria-label="Left half" style={{ color: 'var(--text)' }}><strong>Left half</strong><div style={{ fontFamily: 'monospace' }}>{left.join(', ')}</div></div>
        <div aria-label="Right half" style={{ color: 'var(--text)' }}><strong>Right half</strong><div style={{ fontFamily: 'monospace' }}>{right.join(', ')}</div></div>
      </div>
      <p>Total <strong>{total}</strong>; a balanced split has group sums near <strong>{total / 2}</strong>.</p>
      <p>{c !== null && c !== undefined ? <>Taking <strong>{c}</strong> value(s) from the left.</> : 'Preparing subset sums.'} Best difference so far: <strong>{best === Infinity ? '-' : best}</strong>{bestPair ? ` (sums ${bestPair[0]} and ${bestPair[1]})` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Splitting the array into two halves lets each half enumerate its subsets; matching a left subset with a right subset of the complementary size needs only a binary search.</p>} />
}
