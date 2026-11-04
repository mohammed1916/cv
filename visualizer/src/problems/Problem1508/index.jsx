import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1508',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums, left and right (JSON)',
  url: 'https://leetcode.com/problems/range-sum-of-sorted-subarray-sums/',
  complexity: 'O(n² log n) time and O(n²) space: build every subarray sum, then sort. Fine for the small visual sizes.',
  examples: [
    { label: 'Sample A', input: '{"nums":[1,2,3,4],"left":1,"right":10}' },
    { label: 'Middle ranks', input: '{"nums":[5,9,2],"left":2,"right":4}' },
    { label: 'Single value', input: '{"nums":[7],"left":1,"right":1}' },
  ],
}

const chip = (on, kept) => ({
  minWidth: 36, padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box', color: 'var(--text)',
  border: `${on ? 2 : 1}px solid ${on ? 'var(--text)' : 'var(--border)'}`,
  background: on ? 'color-mix(in srgb, var(--success) 35%, var(--surface2))' : kept ? 'color-mix(in srgb, var(--primary) 22%, var(--surface2))' : 'transparent',
})

export default function RangeSumSortedSubarraySums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { sums, start, end, rank, total, result } = step.snapshot
    const { left, right } = run.input
    const hasWindow = start !== undefined && start !== null
    const inWindow = i => hasWindow && i >= start && i <= end
    const sorted = step.phase === 'sort' || step.phase === 'pick' || step.phase === 'done'
    return <>
      <section aria-label="Input values">
        <h3>Input: l and r mark the current start and end of the subarray</h3>
        <div role="img" aria-label="Input values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {run.input.nums.map((v, i) => <div key={i} style={{ ...chip(false, inWindow(i)), position: 'relative' }}>
            {v}
            <small style={{ display: 'block', height: 14, color: 'var(--text-muted)', fontWeight: 700 }}>
              {hasWindow && i === start ? 'l' : ''}{hasWindow && i === end ? 'r' : ''}
            </small>
          </div>)}
        </div>
      </section>
      <section aria-label="Sums">
        <h3>{sorted ? 'Sums in ascending order, with ranks' : `Sums so far (${sums.length})`}</h3>
        <div role="img" aria-label="Sums" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sums.map((v, i) => {
            const r = i + 1
            const kept = sorted && r >= left && r <= right
            return <div key={i} style={chip(r === rank, kept)}>
              {v}
              {sorted && <small style={{ display: 'block', color: 'var(--text-muted)' }}>rank {r}</small>}
            </div>
          })}
        </div>
      </section>
      <p>{sorted ? `Ranks ${left} to ${right} are kept.` : `Every contiguous subarray is listed once; ${sums.length} sums so far.`}</p>
      <p>Running total: <strong>{total ?? 0}</strong>{result !== undefined && <> → answer <strong>{result}</strong></>}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Enumerate, then rank.</strong> Each start index extends to the right with a running sum. Every contiguous subarray appears exactly once.</p>
    <p><strong>Sort, then add the window.</strong> Ranks are 1-based. The requested ranks form a contiguous block in sorted order.</p>
  </>} />
}
