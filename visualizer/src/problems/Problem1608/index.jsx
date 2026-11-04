import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1608',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Array of integers (JSON)',
  url: 'https://leetcode.com/problems/special-array-with-x-elements-greater-than-or-equal-x/',
  complexity: 'O(n * n) time for a direct count of each candidate, and O(1) extra space.',
  examples: [
    { label: 'Answer 3', input: '[1,9,2,0,5,5]' },
    { label: 'No answer', input: '[0,0,0]' },
    { label: 'Length answer', input: '[7,7,7,7,7,7,7]' },
  ],
}

// Bars show each entry; the dashed line is the candidate x. Bars at or above the line are counted.
function ThresholdBars({ nums, x }) {
  const max = Math.max(1, ...nums)
  const height = 120
  return <figure aria-label="Entries against the candidate" style={{ margin: 0 }}>
    <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 6, height: height + 24, borderBottom: '1px solid var(--border)' }}>
      {x !== null && <div style={{ position: 'absolute', left: 0, right: 0, bottom: (x / Math.max(max, nums.length)) * height, borderTop: '2px dashed var(--primary)' }} />}
      {nums.map((value, i) => {
        const counted = x !== null && value >= x
        return <div key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', flex: '0 0 auto' }}>
          <div style={{ width: 26, height: (value / Math.max(max, nums.length)) * height, minHeight: 2, boxSizing: 'border-box',
            background: counted ? 'var(--primary)' : 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '4px 4px 0 0' }} />
          <small style={{ color: 'var(--text)', fontFamily: 'monospace' }}>{value}</small>
        </div>
      })}
    </div>
    <figcaption style={{ color: 'var(--text-muted)' }}>Purple bars are at least x. The dashed line marks x on the same scale.</figcaption>
  </figure>
}

export default function SpecialValue() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, x, count } = step.snapshot
    return <>
      <ThresholdBars nums={nums} x={x} />
      <p>{x === null ? `Candidates run from 0 to the array length, ${nums.length}.` : `Candidate x = ${x}.`}</p>
      <p>{count === null ? 'No count yet.' : `Entries at least x: ${count}. The candidate matches when this equals x.`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Bounded candidates:</strong> the answer cannot exceed the number of entries, so only 0 to n need checking.</p>
    <p><strong>Exact match:</strong> a candidate works only when the count of qualifying entries equals the candidate itself.</p>
  </>} />
}
