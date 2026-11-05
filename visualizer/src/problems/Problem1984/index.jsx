import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1984',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Scores and k (JSON)',
  url: 'https://leetcode.com/problems/minimum-difference-between-highest-and-lowest-of-k-scores/',
  complexity: 'O(n log n) time for the sort and O(n) for the window; O(n) extra space for the sorted copy.',
  examples: [
    { label: 'One score', input: '{"nums":[50],"k":1}' },
    { label: 'Four of six', input: '{"nums":[15,3,27,9,12,30],"k":4}' },
    { label: 'Tight cluster', input: '{"nums":[1,2,3,4,10],"k":3}' },
  ],
}

export default function MinimumDifferenceOfKScores() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, k, left, right, spread, best, bestWindow } = step.snapshot
    return <>
      <IndexedSequence label="Sorted scores" length={sorted.length} valueAt={i => sorted[i]} active={right}
        roleAt={i => (i === left ? 'l' : i === right ? 'r' : i > left && i < right ? 'in window' : '')} />
      <p>Window of <strong>{k}</strong> scores from <strong>l = {left}</strong> to <strong>r = {right}</strong>. Spread: <strong>{spread ?? '-'}</strong>.</p>
      <p>Best window so far: positions {bestWindow[0]} to {bestWindow[1]}, spread <strong>{best === Infinity ? '-' : best}</strong>.</p>
    </>
  }} renderReasoning={() => <p>After sorting, any k scores with the smallest spread are adjacent, so only windows of k neighbours need checking.</p>} />
}
