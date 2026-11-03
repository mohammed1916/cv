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

const chip = (text, on) => ({
  minWidth: 36, padding: '4px 8px', fontFamily: 'monospace', textAlign: 'center', boxSizing: 'border-box',
  border: `${on ? 2 : 1}px solid ${on ? 'var(--text)' : 'var(--border)'}`,
  background: on ? '#bbf7d0' : 'transparent', color: '#1c1917',
})

export default function RangeSumSortedSubarraySums() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { sums, start, end, rank, total, result } = step.snapshot
    const inRange = i => start !== undefined && start !== null && i >= start && i <= end
    return <>
      <div role="img" aria-label="Input values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.nums.map((v, i) => <div key={i} style={chip(v, inRange(i))}>{v}</div>)}
      </div>
      <p>{sums.length} sum{sums.length === 1 ? '' : 's'} listed{rank ? `, ranks ${run.input.left} to ${run.input.right} being added` : ''}.</p>
      <div role="img" aria-label="Sums" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sums.map((v, i) => <div key={i} style={chip(v, i + 1 === rank)}>{v}</div>)}
      </div>
      <p>Running total: <strong>{total ?? 0}</strong>{result !== undefined && <> → answer <strong>{result}</strong></>}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Enumerate, then rank.</strong> Each start index extends to the right with a running sum. Every contiguous subarray appears exactly once.</p>
    <p><strong>Sort, then add the window.</strong> Ranks are 1-based. The requested ranks form a contiguous block in sorted order.</p>
  </>} />
}
