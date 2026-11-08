import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1937',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON matrix of points (e.g. [[1,2,3],[1,5,1],[3,1,1]])',
  url: 'https://leetcode.com/problems/maximum-number-of-points-with-cost/',
  complexity: 'O(m·n) time with two sweeps per row instead of a quadratic comparison of every pair of columns.',
  examples: [
    { label: 'Three rows', input: '[[1,2,3],[1,5,1],[3,1,1]]' },
    { label: 'Two rows', input: '[[1,0,3],[0,0,0]]' },
    { label: 'Single cell', input: '[[7]]' },
    { label: 'All zeros', input: '[[0,0],[0,0]]' },
    { label: 'Largest values, five by six', input: '[[100000,100000,100000,100000,100000,100000],[100000,100000,100000,100000,100000,100000],[100000,100000,100000,100000,100000,100000],[100000,100000,100000,100000,100000,100000],[100000,100000,100000,100000,100000,100000]]' },
    { label: 'Long run: five by six generated', input: '[[4522,50202,60936,59837,78581,1484],[60534,85867,8031,29854,8415,47916],[87257,74149,26456,99673,34492,85824],[17938,26921,15353,77219,60126,89180],[57804,76900,94677,74335,96627,38558]]' },
  ],
}

export default function Problem1937Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const n = run.input.points[0].length
      const row = run.input.points[step.row] || []
      return <>
        <table aria-label="Dynamic programming row" style={{ borderCollapse: 'collapse' }}>
          <thead><tr><th>column</th>{Array.from({ length: n }, (_, c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            <tr><th>points</th>{row.map((v, c) => <td key={c} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)' }}>{v}</td>)}</tr>
            <tr><th>from left</th>{Array.from({ length: n }, (_, c) => <td key={c} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)', background: step.left && step.left[c] !== undefined ? 'color-mix(in srgb, var(--primary) 12%, var(--surface2))' : 'transparent' }}>{step.left && step.left[c] !== undefined ? step.left[c] : ''}</td>)}</tr>
            <tr><th>from right</th>{Array.from({ length: n }, (_, c) => <td key={c} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)', background: step.right && step.right[c] !== undefined ? 'color-mix(in srgb, var(--success) 14%, var(--surface2))' : 'transparent' }}>{step.right && step.right[c] !== undefined ? step.right[c] : ''}</td>)}</tr>
            <tr><th>best total</th>{step.dp.map((v, c) => <td key={c} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)', fontWeight: 600 }}>{v}</td>)}</tr>
          </tbody>
        </table>
        <p>Row {step.row}. Each side sweep carries the best earlier total minus one per column moved.</p>
        {step.result !== undefined && <output aria-label="Best total">Best total: {step.result}</output>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
