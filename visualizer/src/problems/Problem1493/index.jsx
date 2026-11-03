import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1493',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a nums list of 0s and 1s (JSON)',
  url: 'https://leetcode.com/problems/longest-subarray-of-1s-after-deleting-one-element/',
  complexity: 'O(n) time and O(1) extra space: each index enters and leaves the window once.',
  examples: [
    { label: 'One zero inside', input: '{"nums":[1,1,0,1]}' },
    { label: 'Two zero blocks', input: '{"nums":[0,1,1,1,0,1,1]}' },
    { label: 'All ones', input: '{"nums":[1,1,1]}' },
  ],
}

export default function LongestAfterDelete() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { left, right, zeros, best } = step.snapshot
    return <>
      <div role="img" aria-label="Binary values with the window" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nums.map((value, i) => {
          const inside = right >= 0 && i >= left && i <= right
          return <div key={i} data-index={i} style={{
            width: 36, textAlign: 'center', fontFamily: 'monospace', padding: '6px 0', boxSizing: 'border-box', color: '#1c1917',
            background: inside ? (value === 0 ? '#fecaca' : '#bbf7d0') : '#e7e5e4',
            border: `${i === right ? 2 : 1}px solid ${i === right ? 'var(--text)' : 'var(--border)'}`,
          }}><div>{value}</div><small>{i}</small></div>
        })}
      </div>
      <p>Window [{Math.max(left, 0)}, {right}] holds {zeros} zero(s). Best deletion result so far: {best}.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Window with one allowed zero:</strong> the deleted element can be that zero, so the best window with at most one zero is the answer's source.</p>
    <p><strong>Length minus one:</strong> deleting exactly one element from a window of length L leaves L minus 1 ones, even when the window is all ones.</p>
  </>} />
}
