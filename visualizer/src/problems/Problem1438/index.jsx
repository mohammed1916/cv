import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, phases, code, python, pythonLineMap } from './algorithm'

const definition = {
  number: '1438',
  inputLabel: 'Object with nums and limit',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  pythonLineMap,
  examples: [
    { label: 'Spread', input: '{"nums":[4,2,5,3],"limit":4}' },
    { label: 'Spike', input: '{"nums":[10,1,2,9,3],"limit":2}' },
    { label: 'Equal runs', input: '{"nums":[7,7,8,8,8,7],"limit":0}' },
  ],
  complexity: 'Time O(n) · Space O(n) for the two queues.',
  url: 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/',
}

import IndexedSequence from '../../components/shared/IndexedSequence'

const chip = { minWidth: 38, padding: '4px 6px', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text)', background: 'var(--surface2)' }

// Each queue lists the indices it keeps, with their values; its front is the window's extreme.
function Queue({ label, indices, nums, front }) {
  return <div style={{ marginBottom: 8, color: 'var(--text)' }}>
    <small>{label}</small>
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {indices.length ? indices.map((i, k) => <span key={i} style={{ ...chip, borderColor: k === 0 && front ? 'var(--primary)' : 'var(--border)', borderWidth: k === 0 && front ? 2 : 1 }}>{nums[i]}<br /><small>[{i}]</small></span>)
        : <em>empty</em>}
    </div>
  </div>
}

function WindowVisual({ step, nums, limit }) {
  const { right, left, maxQueue, minQueue, maxValue, minValue, best } = step.snapshot
  const hasWindow = right !== null && right !== undefined
  const roleAt = i => {
    if (!hasWindow) return ''
    const parts = []
    if (i === left) parts.push('l')
    if (i === right) parts.push('r')
    return parts.join(' ')
  }
  return <div>
    <IndexedSequence label={`Values with the window from l to r (limit ${limit})`} length={nums.length} active={hasWindow ? right : -1}
      valueAt={i => nums[i]} roleAt={roleAt} />
    <Queue label="Max queue (front is the largest value in the window)" indices={maxQueue} nums={nums} front />
    <Queue label="Min queue (front is the smallest value in the window)" indices={minQueue} nums={nums} front />
    <p style={{ color: 'var(--text)' }}>
      {hasWindow ? `Window [${left}, ${right}]: max ${maxValue}, min ${minValue}, spread ${maxValue - minValue}.` : 'No window yet.'} Best length so far: {best}.
    </p>
  </div>
}

export default function LongestWithinAbsoluteLimit() {
  return <AlgorithmWorkspace definition={definition}
    renderVisual={({ run, step }) => <WindowVisual step={step} nums={run.input.nums} limit={run.input.limit} />}
    renderReasoning={() => <p>Each queue's front is the window's current extreme, so the spread can be read in constant time while the window slides. The left end l only moves forward.</p>} />
}
