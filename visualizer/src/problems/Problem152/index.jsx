import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '152',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'JSON array of integers from -10 to 10',
  url: 'https://leetcode.com/problems/maximum-product-subarray/',
  complexity: 'O(n) time and O(1) extra space: each value updates only the running maximum, minimum and answer.',
  examples: [
    { label: 'Mixed signs', input: '[2,3,-2,4]' },
    { label: 'Two negatives', input: '[-2,3,-4]' },
    { label: 'Zero reset', input: '[-2,0,-1]' },
  ],
}

function Tile({ label, value }) {
  return <div style={{ minWidth: 96, padding: '8px 10px', border: '1px solid var(--border)', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 20 }}>{value}</div>
  </div>
}

export default function MaxProductSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, num, candidates, curMax, curMin, best } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {run.input.nums.map((v, i) => <div key={i} style={{
          minWidth: 46, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Tile label="Running max" value={curMax} />
        <Tile label="Running min" value={curMin} />
        <Tile label="Best" value={best} />
        <Tile label="Candidates" value={candidates ? candidates.join(', ') : '-'} />
      </div>
      {num != null && <p>Current value: {num}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Keep two extremes:</strong> a negative value can turn the smallest product into the largest, so the minimum must be tracked as well as the maximum.</p>
    <p><strong>Restart by value:</strong> each candidate starts a fresh subarray at the current value or extends the previous extremes.</p>
  </>} />
}
