import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1664',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of positive integers (JSON)',
  url: 'https://leetcode.com/problems/ways-to-make-a-fair-array/',
  complexity: 'O(n) time and O(1) extra space: two prefix sums per parity, updated while scanning once.',
  examples: [
    { label: 'One fair deletion', input: '[2,1,6,4]' },
    { label: 'Every deletion', input: '[1,1,1]' },
    { label: 'None fair', input: '[1,2,3]' },
  ],
}

const cell = { minWidth: 48, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)' }

export default function FairArray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const nums = run.input
    const { index, newEven, newOdd, fair, count } = step.snapshot
    return <>
      <div role="img" aria-label="Array values with parity" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, i) => <div key={i} style={{
          ...cell, color: '#1c1917',
          background: index === i ? (fair ? '#bbf7d0' : '#fde68a') : i % 2 === 0 ? '#e0f2fe' : '#f5f5f4',
          outline: index === i ? '2px solid var(--primary)' : 'none',
          opacity: index !== null && index === i ? 1 : 0.95,
        }}>
          <div>{value}</div><small>{i % 2 === 0 ? 'even' : 'odd'} {i}</small>
        </div>)}
      </div>
      {index !== null && newEven !== null && <p>Deleting index {index}: even sum {newEven}, odd sum {newOdd}{fair !== null ? (fair ? ' (fair)' : ' (not fair)') : ''}.</p>}
      <p>Fair deletions counted so far: {count}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Parity flips:</strong> removing one value shifts every later value by one position. Later even positions become odd, and later odd positions become even.</p>
    <p><strong>Prefix plus suffix:</strong> the new even sum is the earlier even sum plus the later odd sum, and the new odd sum is the earlier odd sum plus the later even sum. Totals minus prefixes give the suffixes in constant time per index.</p>
  </>} />
}
