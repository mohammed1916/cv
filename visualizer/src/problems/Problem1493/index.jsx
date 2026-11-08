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
    { label: 'Single zero', input: '{"nums":[0]}' },
    { label: 'Single one', input: '{"nums":[1]}' },
    { label: 'Equal zero gaps', input: '{"nums":[1,0,1,0,1]}' },
    { label: 'Long run: 20 values', input: '{"nums":[0,1,1,0,0,0,1,0,1,0,1,1,0,1,1,1,1,1,0,0]}' },
  ],
}

export default function LongestAfterDelete() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { left, right, zeros, best } = step.snapshot
    const hasWindow = right >= 0
    return <>
      <div role="img" aria-label="Binary values with the window" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {nums.map((value, i) => {
          const inside = hasWindow && i >= left && i <= right
          const isZero = value === 0
          return <div key={i} data-index={i} style={{
            width: 40, textAlign: 'center', fontFamily: 'monospace', padding: '6px 0 2px', boxSizing: 'border-box', color: 'var(--text)',
            background: inside
              ? (isZero ? 'color-mix(in srgb, var(--warning) 40%, var(--surface2))' : 'color-mix(in srgb, var(--success) 35%, var(--surface2))')
              : 'var(--surface)',
            border: `${i === right ? 2 : 1}px solid ${i === right ? 'var(--text)' : 'var(--border)'}`,
            opacity: inside || !hasWindow ? 1 : 0.5,
          }}>
            <div>{value}</div>
            <small>{i}</small>
            <div style={{ height: 14, fontWeight: 700, color: 'var(--text-muted)' }}>
              {i === left && hasWindow ? 'l' : ''}{i === right ? 'r' : ''}
            </div>
          </div>
        })}
      </div>
      <p>Window [l = {Math.max(left, 0)}, r = {Math.max(right, 0)}] holds {zeros} zero{zeros === 1 ? '' : 's'}. The one allowed deletion can remove a zero from the window.</p>
      <p>Best length after deleting one element so far: {best}. A window of length L gives L minus 1.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Window with one allowed zero:</strong> the deleted element can be that zero, so the best window with at most one zero is the answer's source.</p>
    <p><strong>Length minus one:</strong> deleting exactly one element from a window of length L leaves L minus 1 ones, even when the window is all ones.</p>
  </>} />
}
