import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1619',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr, 20, 40 integers from 0 to 1000 (JSON)',
  url: 'https://leetcode.com/problems/mean-of-array-after-removing-some-elements/',
  complexity: 'O(n log n) time for the sort and O(n) for the sum, with O(n) extra space for the sorted copy.',
  examples: [
    { label: 'Twenty values', input: JSON.stringify({ arr: [4, 9, 1, 7, 3, 8, 2, 6, 5, 0, 100, 12, 11, 10, 13, 14, 15, 16, 17, 18] }) },
    { label: 'Flat values', input: JSON.stringify({ arr: Array(20).fill(7) }) },
    { label: 'Forty values', input: JSON.stringify({ arr: Array.from({ length: 40 }, (_, i) => (i * 37) % 101) }) },
  ],
}

export default function TrimmedMeanVisualizer() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const snap = step.snapshot
    const values = snap.sorted ?? run.input.arr
    const n = values.length
    const removed = new Set([...snap.removedLow.map(v => `low:${v}`), ...snap.removedHigh.map(v => `high:${v}`)])
    const lowCount = snap.removedLow.length
    const highCount = snap.removedHigh.length
    return <>
      <div role="img" aria-label={snap.sorted ? 'Sorted values' : 'Input values'} style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {values.map((value, index) => {
          const dropped = snap.sorted && (index < lowCount || index >= n - highCount)
          const kept = snap.kept && snap.sorted && index >= snap.k && index < n - snap.k
          return <div key={index} data-index={index} style={{
            minWidth: 36, padding: '4px 6px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
            border: '1px solid var(--border)', color: 'var(--text)',
            background: dropped ? 'color-mix(in srgb, var(--error) 25%, transparent)' : kept ? 'color-mix(in srgb, var(--success) 28%, transparent)' : 'transparent', opacity: dropped ? 0.6 : 1,
          }}>{value}</div>
        })}
      </div>
      <p style={{ color: 'var(--text)' }}>{`Red values are dropped (${lowCount} from the bottom, ${highCount} from the top). Green values are kept. Removed ${lowCount} from the bottom and ${highCount} from the top (${removed.size} values total). Five percent of ${n} is ${snap.k}.`}</p>
      {snap.kept && <output aria-label="Running total">{`Running total ${snap.total} over ${snap.kept.length} kept values`}</output>}
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Sort first:</strong> the smallest and largest values are exactly the ones at the two ends of the sorted list, so removing them is just slicing.</p>
    <p><strong>Average what is left:</strong> divide the sum of the kept values by how many were kept, not by the original length.</p>
  </>} />
}
