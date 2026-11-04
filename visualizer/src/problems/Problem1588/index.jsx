import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1588',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with arr (JSON)',
  url: 'https://leetcode.com/problems/sum-of-all-odd-length-subarrays/',
  complexity: 'O(n) time and O(1) extra space: each value is weighted by its coverage count.',
  examples: [
    { label: 'Sample A', input: '{"arr":[2,1,3]}' },
    { label: 'Mixed signs', input: '{"arr":[-4,5,-1,2]}' },
    { label: 'Single value', input: '{"arr":[7]}' },
  ],
}

const ODD = 'color-mix(in srgb, var(--success) 35%, transparent)'

// Rows are the possible starts up to i, columns the possible ends from i. A cell is one subarray covering i.
function CoverageGrid({ n, i }) {
  const starts = Array.from({ length: i + 1 }, (_, s) => s)
  const ends = Array.from({ length: n - i }, (_, e) => i + e)
  return <table aria-label={`Subarrays covering position ${i}`} style={{ borderCollapse: 'collapse', fontFamily: 'monospace', color: 'var(--text)' }}>
    <caption style={{ textAlign: 'left', color: 'var(--text-muted)' }}>Rows: start. Columns: end. Green: odd length.</caption>
    <thead><tr><th scope="col" /> {ends.map(e => <th key={e} scope="col" style={{ padding: '2px 6px' }}>{e}</th>)}</tr></thead>
    <tbody>{starts.map(s => <tr key={s}>
      <th scope="row" style={{ padding: '2px 6px' }}>{s}</th>
      {ends.map(e => <td key={e} style={{ width: 28, height: 28, textAlign: 'center', border: '1px solid var(--border)',
        background: (e - s + 1) % 2 === 1 ? ODD : 'transparent' }}>{e - s + 1}</td>)}
    </tr>)}</tbody>
  </table>
}

export default function OddLengthSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { arr } = run.input
    const { i, left, right, odd, total } = step.snapshot
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {arr.map((value, k) => <div key={k} data-index={k} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', color: 'var(--text)',
          border: `${k === i ? 2 : 1}px solid ${k === i ? 'var(--text)' : 'var(--border)'}`,
          background: i >= 0 && k < i ? 'var(--surface2)' : 'transparent',
        }}><div>{value}</div><small>{k}</small></div>)}
      </div>
      {i >= 0 && <CoverageGrid n={arr.length} i={i} />}
      <p>{i < 0 ? 'No position is active yet.' : `Position ${i} is covered by ${left * right} subarrays (${left} starts x ${right} ends); ${odd} of them have odd length.`}</p>
      <p>Running total: <strong>{total}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Count per position:</strong> a position is covered by left x right subarrays. About half of them, rounded up, have odd length.</p>
    <p><strong>Why it works:</strong> the total is the sum of each value multiplied by its coverage, so one pass is enough.</p>
  </>} />
}
