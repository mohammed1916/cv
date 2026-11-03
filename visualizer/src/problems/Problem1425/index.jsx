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
  ],
}

export default function ConstrainedSubsequenceSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { current, window, dp, answer, dropped = [], popped = [] } = step.snapshot
    const inWindow = new Set(window)
    return <>
      <div role="img" aria-label="Values with best sums" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 60, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === current ? 2 : 1}px solid ${i === current ? 'var(--text)' : 'var(--border)'}`,
          background: inWindow.has(i) ? '#bae6fd' : dropped.includes(i) ? '#fecaca' : popped.includes(i) ? '#fde68a' : 'transparent', color: '#1c1917',
        }}><div>{value}</div><small>dp {dp[i] ?? '-'}</small><div><small>{i}</small></div></div>)}
      </div>
      <p>{window.length ? `Window (decreasing best sums, oldest first): ${window.map(i => `${i}:${dp[i]}`).join(', ')}` : 'Window is empty.'}</p>
      <p>{answer === null ? 'Answer: not yet set.' : `Best answer so far: ${answer}`}</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Chain idea:</strong> the best sum ending at index i is nums[i] plus the best valid earlier sum, and an earlier sum that is negative is simply skipped.</p>
    <p><strong>Monotonic window:</strong> the front of the window holds the largest best sum still within reach, so each step needs only one read from the front.</p>
  </>} />
}
