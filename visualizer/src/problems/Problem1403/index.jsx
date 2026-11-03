import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1403',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Positive values (JSON array)',
  url: 'https://leetcode.com/problems/minimum-subsequence-in-non-increasing-order/',
  complexity: 'O(n log n) time for the sort, then one pass over the sorted values. O(n) extra space.',
  examples: [
    { label: 'Small', input: '[2, 7, 5, 1]' },
    { label: 'Equal values', input: '[3, 3, 3, 3]' },
    { label: 'One value', input: '[9]' },
  ],
}

const tile = { minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }

export default function MinimumSubsequence() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { sorted, index, taken, chosen, rest } = step.snapshot
    return <>
      <div role="img" aria-label="Values from largest to smallest" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sorted.map((value, i) => <div key={i} style={{
          ...tile, borderWidth: i === index ? 2 : 1,
          background: i < taken.length ? '#bbf7d0' : 'transparent', color: i < taken.length ? '#1c1917' : 'var(--text)',
        }}><div>{value}</div><small>{i}</small></div>)}
      </div>
      <p>Chosen sum: <strong>{chosen}</strong> · Sum of the rest: <strong>{rest}</strong></p>
      <p>Stop as soon as the chosen sum is strictly greater than the rest.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Largest first:</strong> for any fixed group size, the largest values give the largest sum, so the greedy prefix is the best group of that size.</p>
    <p><strong>Shortest wins:</strong> the first prefix that beats the remaining values is the shortest valid group, and it has the largest sum among groups of that length.</p>
  </>} />
}
