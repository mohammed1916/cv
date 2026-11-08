import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1425',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and k (JSON)',
  url: 'https://leetcode.com/problems/constrained-subsequence-sum/',
  complexity: 'O(n) time and O(n) space: each index enters and leaves the monotonic window at most once.',
  examples: [
    { label: 'Mixed signs', input: '{"nums":[10,-2,-10,-5,20],"k":2}' },
    { label: 'All negative', input: '{"nums":[-1,-2,-3],"k":1}' },
    { label: 'Wide window', input: '{"nums":[4,-3,6,-8,2],"k":3}' },
    { label: 'One number', input: '{"nums":[7],"k":1}' },
    { label: 'Equal values', input: '{"nums":[3,3,3,3],"k":2}' },
    { label: 'Extreme values, 16 numbers', input: '{"nums":[-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100,-100,100],"k":8}' },
    { label: 'Long run: 16 numbers', input: '{"nums":[-17,-27,-9,-52,13,-54,1,88,-4,-6,-37,42,-95,86,23,61],"k":5}' },
  ],
}

import IndexedSequence from '../../components/shared/IndexedSequence'

const tile = { minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', background: 'var(--surface2)' }

export default function ConstrainedSubsequenceSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums, k } = run.input
    const { current, window, dp, answer, dropped = [], popped = [] } = step.snapshot
    const lo = current === null ? -1 : Math.max(0, current - k)
    const hi = current === null ? -1 : current - 1
    const hasRange = current !== null && hi >= lo && hi >= 0
    const roleAt = i => {
      const parts = []
      if (hasRange && i === lo) parts.push('l')
      if (hasRange && i === hi) parts.push('r')
      return parts.join(' ')
    }
    const inWindow = new Set(window)
    return <>
      <IndexedSequence label="Values, with the allowed earlier range from l to r" length={nums.length} active={current ?? -1}
        valueAt={i => nums[i]} roleAt={roleAt} />
      <p style={{ color: 'var(--text)' }}>
        {hasRange ? `Index ${current} may follow any index from ${lo} to ${hi}, which is at most ${k} places back.` : 'Nothing is being extended yet.'}
      </p>
      <div role="img" aria-label="Best sum ending at each index" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {nums.map((_, i) => <div key={i} style={{
          ...tile, borderWidth: i === current ? 2 : 1, borderColor: i === current ? 'var(--primary)' : 'var(--border)',
          opacity: dp[i] === undefined ? 0.4 : 1,
          background: inWindow.has(i) ? 'var(--primary)' : dropped.includes(i) ? 'var(--surface2)' : 'transparent',
          color: inWindow.has(i) ? '#fff' : 'var(--text)',
        }}><div>dp {dp[i] ?? '-'}</div><small>{i}</small></div>)}
      </div>
      <p style={{ color: 'var(--text)' }}>{window.length ? `Monotonic window (largest best sum at the front): ${window.map(i => `${i}:${dp[i]}`).join(', ')}` : 'Window is empty.'}</p>
      {popped.length > 0 && <p style={{ color: 'var(--text)' }}>Removed from the back as weaker: {popped.join(', ')}</p>}
      <p style={{ color: 'var(--text)' }}>{answer === null ? 'Answer: not yet set.' : `Best answer so far: ${answer}`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Chain idea:</strong> the best sum ending at index i is nums[i] plus the best valid earlier sum, and an earlier sum that is negative is simply skipped.</p>
    <p><strong>Monotonic window:</strong> the front of the window holds the largest best sum still within reach, so each step needs only one read from the front.</p>
  </>} />
}
