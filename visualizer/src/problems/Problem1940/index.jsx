import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1940',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON array of strictly increasing arrays (e.g. [[1,3,4],[1,4,5],[1,4,6]])',
  url: 'https://leetcode.com/problems/longest-common-subsequence-between-sorted-arrays/',
  complexity: 'O(total length) time with a hash map of counts, plus a sort of the common values.',
  examples: [
    { label: 'Three arrays', input: '[[1,3,4],[1,4,5],[1,4,6]]' },
    { label: 'No overlap', input: '[[2,5],[3,6]]' },
    { label: 'Single value', input: '[[7]]' },
    { label: 'Identical arrays', input: '[[2,4],[2,4]]' },
    { label: 'Long run: five arrays of eight', input: '[[4,5,7,11,12,13,15,16],[2,3,6,8,15,16,19,20],[2,3,6,7,8,11,13,14],[1,2,7,8,11,12,15,19],[1,2,3,12,14,21,28,30]]' },
  ],
}

export default function Problem1940Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const values = [...new Set(run.input.arrays.flat())].sort((a, b) => a - b)
      return <>
        {run.input.arrays.map((arr, a) => <div key={a} style={{ display: 'flex', gap: 4, alignItems: 'center', opacity: step.arrayIndex >= a || step.arrayIndex < 0 ? 1 : 0.5 }}>
          <strong style={{ width: 70 }}>array {a}</strong>
          {arr.map(v => <span key={v} style={{ padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', background: step.arrayIndex === a ? 'color-mix(in srgb, var(--primary) 18%, var(--surface2))' : 'var(--surface2)' }}>{v}</span>)}
        </div>)}
        <table aria-label="Appearance counts" style={{ borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr><th>value</th>{values.map(v => <th key={v}>{v}</th>)}</tr></thead>
          <tbody>
            <tr><th>arrays containing it</th>{values.map(v => <td key={v} style={{ textAlign: 'center', padding: '2px 6px', border: '1px solid var(--border)', fontWeight: step.count[v] === run.input.arrays.length ? 700 : 400 }}>{step.count[v] || 0}</td>)}</tr>
          </tbody>
        </table>
        <p>A value is kept when its count equals the number of arrays ({run.input.arrays.length}).</p>
        {step.result !== undefined && <output aria-label="Common values">Common values: {JSON.stringify(step.result)}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
