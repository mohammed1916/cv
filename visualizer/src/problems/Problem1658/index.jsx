import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1658',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and x (JSON)',
  url: 'https://leetcode.com/problems/minimum-operations-to-reduce-x-to-zero/',
  complexity: 'O(n) time and O(1) extra space: a sliding window finds the longest middle block whose sum is total minus x.',
  examples: [
    { label: 'Ends sum to x', input: '{"nums":[2,3,1,5,4],"x":6}' },
    { label: 'Middle block', input: '{"nums":[4,1,3,2,5],"x":6}' },
    { label: 'Too large', input: '{"nums":[6,2,8,3],"x":9}' },
  ],
}

const cell = { width: 34, height: 34, boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', border: '1px solid var(--border)' }

export default function MinimumOperations() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { left, right, window, target, best } = step.snapshot
    const inBlock = i => left !== null && right !== null && i >= left && i <= right && left <= right
    return <>
      <div role="img" aria-label="Array with the middle block highlighted" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {nums.map((value, i) => <div key={i} data-index={i} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
          <small style={{ minHeight: 16, color: 'var(--text)', fontWeight: 700 }}>{left === i && right === i ? 'l r' : left === i ? 'l' : right === i ? 'r' : ''}</small>
          <div style={{ ...cell, padding: '4px 6px', color: 'var(--text)',
            background: inBlock(i) ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'transparent',
            outline: left === i || right === i ? '2px solid var(--primary)' : 'none' }}><div>{value}</div><small>{i}</small></div>
        </div>)}
      </div>
      <p style={{ color: 'var(--text)' }}>Green is the block between l and r. Target block sum: {target} · current block sum: {window} · longest matching block: {best}</p>
      <p>{run.result === -1 ? 'No block matches, so the answer is -1.' : `Answer: ${run.result}`}</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Complement view:</strong> removing a prefix and a suffix leaves one contiguous middle block. Keeping the longest such block minimises removals.</p>
    <p><strong>Sliding window:</strong> every value is positive, so growing the block increases its sum and shrinking from the left decreases it. One pass with two pointers finds the longest block.</p>
  </>} />
}
