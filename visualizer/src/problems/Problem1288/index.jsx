import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1288',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of [start, end] pairs (JSON)',
  url: 'https://leetcode.com/problems/remove-covered-intervals/',
  complexity: 'O(n log n) time for sorting, then O(n) for the sweep; O(n) space for the order.',
  examples: [
    { label: 'Nested pair', input: '[[1,4],[2,3],[5,7]]' },
    { label: 'Chain', input: '[[0,10],[2,4],[3,9],[9,12]]' },
    { label: 'Single', input: '[[4,6]]' },
  ],
}

export default function CoveredIntervals() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { order, current, maxEnd, kept, covered } = step.snapshot
    const width = 100 / 101
    return <>
      <div role="img" aria-label="Intervals on a number line" style={{ position: 'relative', height: 28 + order.length * 22, border: '1px solid var(--border)' }}>
        {maxEnd !== null && <div aria-label={`Furthest kept end ${maxEnd}`} style={{ position: 'absolute', top: 0, bottom: 0, left: `${maxEnd * width}%`, borderLeft: '2px dashed var(--primary)' }} />}
        {order.map((it, row) => {
          const isKept = kept.includes(it.index)
          const isCurrent = it.index === current
          return <div key={it.index} style={{
            position: 'absolute', top: 6 + row * 22, left: `${it.start * width}%`, width: `${Math.max((it.end - it.start) * width, 1)}%`,
            height: 16, boxSizing: 'border-box', fontFamily: 'monospace', fontSize: 11, color: '#1c1917',
            background: isKept ? '#bbf7d0' : covered && isCurrent ? '#fecaca' : '#e7e5e4',
            border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? 'var(--text)' : 'var(--border)'}`,
          }}>[{it.start},{it.end}]</div>
        })}
      </div>
      <p>{current === null ? 'Sorted order shown; no interval is being compared.' : `Comparing interval #${current}. Furthest kept end: ${maxEnd ?? 'none'}.`}</p>
      <p>Kept so far: {kept.length}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Sort, then sweep:</strong> after sorting by start, an interval can only be covered by one that started earlier or at the same point.</p>
    <p><strong>Furthest end:</strong> the earlier intervals reduce to a single number; an interval is covered exactly when it ends no later than that.</p>
  </>} />
}
