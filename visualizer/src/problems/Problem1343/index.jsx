import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1343',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with arr, k and threshold (JSON)',
  url: 'https://leetcode.com/problems/number-of-sub-arrays-of-size-k-and-average-greater-than-or-equal-to-threshold/',
  complexity: 'O(n) time and O(1) extra space: one initial sum, then one subtraction and one addition per slide.',
  examples: [
    { label: 'Rising tail', input: '{"arr":[2,2,2,2,5,5,5,8],"k":3,"threshold":4}' },
    { label: 'Exact match', input: '{"arr":[4,4,4],"k":2,"threshold":4}' },
    { label: 'Single values', input: '{"arr":[1,5,3,7],"k":1,"threshold":4}' },
  ],
}

export default function WindowAverages() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const { arr, k, start, sum, target, count, ok } = step.snapshot
    const inWindow = i => start !== null && start !== undefined && i >= start && i < start + k
    return <>
      <div role="img" aria-label="Array with current window" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 44, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', color: '#1c1917',
          border: `${inWindow(i) ? 2 : 1}px solid var(--border)`,
          background: inWindow(i) ? (ok === false ? '#fecaca' : ok ? '#bbf7d0' : '#bfdbfe') : 'transparent',
        }}><div>{value}</div><small>{i}</small></div>)}
      </div>
      <p>Target sum: <strong>{target}</strong>{sum !== null && sum !== undefined ? <> · window sum: <strong>{sum}</strong></> : null} · counted: <strong>{count}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>No division:</strong> an average of at least the threshold means the sum is at least k times the threshold, so only integer sums are compared.</p>
    <p><strong>Sliding:</strong> the next window differs from the current one by a single value leaving and a single value entering.</p>
  </>} />
}
