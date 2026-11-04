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
  return <div style={{ minWidth: 96, padding: '8px 10px', border: '1px solid var(--border)', boxSizing: 'border-box', color: 'var(--text)' }}>
    <div style={{ fontSize: 12, opacity: 0.75 }}>{label}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 20 }}>{value}</div>
  </div>
}

const cell = { border: '1px solid var(--border)', padding: '4px 8px', textAlign: 'right', fontFamily: 'monospace', color: 'var(--text)' }

// Rebuild the DP table rows from the frames played so far: one row per index.
function rowsUpTo(frames, current) {
  const rows = []
  for (let k = 0; k <= current; k++) {
    const f = frames[k]
    if (!f.snapshot || f.snapshot.index === null || f.snapshot.index === undefined) continue
    const { index, curMax, curMin, best } = f.snapshot
    if (f.phase === 'start') rows[0] = { index: 0, num: f.snapshot.num ?? f.snapshot.curMax, curMax, curMin, best }
    if (f.phase === 'record') rows[index] = { index, num: f.snapshot.num, curMax, curMin, best }
  }
  return rows.filter(Boolean)
}

export default function MaxProductSubarray() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { index, num, candidates, curMax, curMin, best } = step.snapshot
    const current = run.frames.indexOf(step)
    const rows = rowsUpTo(run.frames, current)
    const nums = run.input.nums
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((v, i) => <div key={i} style={{
          minWidth: 46, padding: '6px 8px', textAlign: 'center', fontFamily: 'monospace', boxSizing: 'border-box', color: 'var(--text)',
          border: `${i === index ? 2 : 1}px solid ${i === index ? 'var(--text)' : 'var(--border)'}`,
          background: i === index ? 'var(--primary)' : 'transparent',
        }}><div>{v}</div><small>{i}</small></div>)}
      </div>
      <table aria-label="Two-state table: best product ending at each index" style={{ borderCollapse: 'collapse', marginTop: 10 }}>
        <thead><tr>
          <th style={cell}>i</th><th style={cell}>nums[i]</th><th style={cell}>max ending here</th><th style={cell}>min ending here</th><th style={cell}>best so far</th>
        </tr></thead>
        <tbody>{rows.map(r => <tr key={r.index} style={{ background: r.index === index ? 'var(--surface2)' : 'transparent' }}>
          <td style={cell}>{r.index}</td><td style={cell}>{r.num}</td><td style={cell}>{r.curMax}</td><td style={cell}>{r.curMin}</td><td style={cell}>{r.best}</td>
        </tr>)}</tbody>
      </table>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
        <Tile label="Running max" value={curMax} />
        <Tile label="Running min" value={curMin} />
        <Tile label="Best" value={best} />
        <Tile label="Candidates" value={candidates ? candidates.join(', ') : '-'} />
      </div>
      {num != null && <p style={{ color: 'var(--text)' }}>Current value: {num}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Keep two extremes:</strong> a negative value can turn the smallest product into the largest, so the minimum must be tracked as well as the maximum.</p>
    <p><strong>Restart by value:</strong> each candidate starts a fresh subarray at the current value or extends the previous extremes.</p>
  </>} />
}
