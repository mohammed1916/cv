import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, pythonLineMap, phases } from './algorithm'

const definition = {
  number: '1582',
  phases, parse: parseInput, build: buildTrace, code, python, pythonLineMap,
  inputLabel: 'Object with mat (JSON)',
  url: 'https://leetcode.com/problems/special-positions-in-a-binary-matrix/',
  complexity: 'O(m * n) time and O(m + n) extra space for the row and column tallies.',
  examples: [
    { label: 'Diagonal pair', input: '{"mat":[[0,1],[1,0]]}' },
    { label: 'Full row', input: '{"mat":[[1,1],[0,0]]}' },
    { label: 'Scattered', input: '{"mat":[[0,1,0,0],[0,0,0,1],[1,0,0,0]]}' },
    { label: "Single cell", input: "{\"mat\":[[1]]}" },
    { label: "No special cell", input: "{\"mat\":[[0,0],[0,0]]}" },
    { label: "Single column", input: "{\"mat\":[[0],[1],[0]]}" },
    { label: "Twelve by twelve, all ones", input: "{\"mat\":[[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,1,1,1]]}" },
    { label: "Long run: 12 by 12 pattern", input: "{\"mat\":[[1,1,0,1,1,1,1,1,1,1,1,1],[1,1,0,0,0,1,0,0,1,0,1,1],[0,0,1,1,1,0,1,1,1,1,1,0],[1,1,0,0,1,0,1,0,1,1,0,0],[0,1,1,0,1,0,0,1,0,0,0,0],[1,0,0,0,1,0,0,1,1,0,1,1],[1,0,0,0,1,0,1,1,0,0,0,1],[1,1,1,0,0,0,1,0,1,1,1,0],[1,0,1,1,1,0,0,1,1,1,1,1],[1,0,0,0,0,0,1,1,1,1,1,1],[0,1,0,1,0,1,0,1,1,0,1,0],[1,0,1,0,1,1,0,1,0,0,1,0]]}" },
  ],
}

export default function SpecialPositions() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { mat } = run.input
    const { rows, cols, special, i, j } = step.snapshot
    const found = new Set(special.map(([a, b]) => `${a},${b}`))
    return <>
      <table aria-label="Matrix with tallies" style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
        <thead><tr><th />{cols.map((c, col) => <th key={col}>col {col}<br />{c}</th>)}<th>row sum</th></tr></thead>
        <tbody>{mat.map((row, r) => <tr key={r}>
          <th>row {r}</th>
          {row.map((v, c) => {
            const key = `${r},${c}`
            const current = r === i && c === j
            return <td key={c} data-cell={key} style={{
              width: 44, height: 40, textAlign: 'center', border: current ? '2px solid var(--text)' : '1px solid var(--border)',
              background: found.has(key) ? 'color-mix(in srgb, var(--success) 35%, transparent)' : 'transparent', color: 'var(--text)',
            }}>{v}</td>
          })}
          <td>{rows[r]}</td>
        </tr>)}</tbody>
      </table>
      <p>{found.size} special cell(s) so far.</p>
    </>
  }} renderReasoning={({ step }) => <>
    <p><strong>Tally first:</strong> a 1 is special only when its row and its column contain no other 1.</p>
    <p><strong>Then check:</strong> precomputed tallies make each cell a constant-time test.</p>
  </>} />
}
