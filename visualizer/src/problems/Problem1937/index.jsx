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
            <tr><th>from right</th>{Array.from({ length: n }, (_, c) => <td key={c} style={{ textAlign: 'center', padding: '4px 8px', border: '1px solid var(--border)', background: step.right && step.right[c] !== undefined ? 'color-mix(in srgb, var(--success, #16a34a) 14%, var(--surface2))' : 'transparent' }}>{step.right && step.right[c] !== undefined ? step.right[c] : ''}</td>)}</tr>
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
