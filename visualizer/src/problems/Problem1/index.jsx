import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with nums and target (JSON)',
  url: 'https://leetcode.com/problems/two-sum/',
  complexity: 'O(n) expected time and O(n) space: one pass with a map of values already seen.',
  examples: [
    { label: 'Sample A', input: '{"nums":[3,8,5,11],"target":13}' },
    { label: 'Repeated value', input: '{"nums":[4,1,4,9],"target":8}' },
    { label: 'No pair', input: '{"nums":[1,2,3],"target":10}' },
  ],
}

export default function TwoSum() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { nums } = run.input
    const { current, need, seen, pair } = step.snapshot
    const pairSet = new Set(pair ?? [])
    return <>
      <div role="img" aria-label="Array values" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {nums.map((value, i) => <div key={i} data-index={i} style={{
          minWidth: 52, padding: '6px 8px', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace',
          border: `${i === current || pairSet.has(i) ? 2 : 1}px solid ${i === current ? 'var(--text)' : 'var(--border)'}`,
          background: pairSet.has(i) ? '#bbf7d0' : i === current ? 'var(--surface2)' : 'transparent', color: '#1c1917',
        }}><div>{value}</div><small>{i}</small></div>)}
      </div>
      <p>{need === null ? 'No complement is being searched.' : `Needed complement: ${need}`}</p>
      <table aria-label="Seen values" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th>value</th><th>index</th></tr></thead>
        <tbody>{seen.length === 0 ? <tr><td colSpan={2}>empty</td></tr> : seen.map(entry => <tr key={entry.value}><td>{entry.value}</td><td>{entry.index}</td></tr>)}</tbody>
      </table>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>One pass:</strong> before storing the current value, look for its complement among earlier values. This ensures the same index is never paired with itself.</p>
    <p><strong>Why a map:</strong> a stored value answers the lookup in constant expected time, so one scan is enough.</p>
  </>} />
}
