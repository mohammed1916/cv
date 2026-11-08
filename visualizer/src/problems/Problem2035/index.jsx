import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
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
    { label: 'Pair', input: '[10,-10]' }, { label: "Smallest pair", input: "[-1000,1000]" }, { label: "Equal values", input: "[4,4,4,4]" }, { label: "Extreme values", input: "[1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000,1000,-1000]" }, { label: "Long run: 16 values", input: "[324,-829,141,-191,326,123,159,250,-649,-735,198,-551,-966,-860,-269,-741]" },
  ],
}

export default function PartitionArrayMinimizeSumDifference() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { left, right, total, c, best, bestPair } = step.snapshot
    return <>
      <div style={{ display: 'grid', gap: 12 }}>
        <IndexedSequence label="Left half" length={left.length} valueAt={i => left[i]} />
        <IndexedSequence label="Right half" length={right.length} valueAt={i => right[i]} />
      </div>
      <p>Total <strong>{total}</strong>; a balanced split has group sums near <strong>{total / 2}</strong>.</p>
      <p>{c !== null && c !== undefined ? <>Taking <strong>{c}</strong> value(s) from the left.</> : 'Preparing subset sums.'} Best difference so far: <strong>{best === Infinity ? '-' : best}</strong>{bestPair ? ` (sums ${bestPair[0]} and ${bestPair[1]})` : ''}.</p>
    </>
  }} renderReasoning={() => <p>Splitting the array into two halves lets each half enumerate its subsets; matching a left subset with a right subset of the complementary size needs only a binary search.</p>} />
}
