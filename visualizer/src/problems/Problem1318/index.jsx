import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1318',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a, b and c (JSON)',
  url: 'https://leetcode.com/problems/minimum-flips-to-make-a-or-b-equal-to-c/',
  complexity: 'O(1) for this fixed 10-bit scan: each bit position is inspected once.',
  examples: [
    { label: 'Mixed bits', input: '{"a":12,"b":5,"c":6}' },
    { label: 'Both sources', input: '{"a":2,"b":6,"c":5}' },
    { label: 'Clear only', input: '{"a":8,"b":8,"c":0}' },
  ],
}

const cell = { padding: '4px 10px', fontFamily: 'monospace', textAlign: 'center' }

export default function MinimumFlips() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { bit, x, y, z, flips, rows } = step.snapshot
    return <>
      <p style={{ fontFamily: 'monospace' }}>a = {run.input.a.toString(2).padStart(10, '0')} · b = {run.input.b.toString(2).padStart(10, '0')} · c = {run.input.c.toString(2).padStart(10, '0')}</p>
      <table aria-label="Bit comparison" style={{ borderCollapse: 'collapse' }}>
        <thead><tr><th style={cell}>bit</th><th style={cell}>a</th><th style={cell}>b</th><th style={cell}>c</th><th style={cell}>flips</th></tr></thead>
        <tbody>
          {rows.map(r => <tr key={r.bit}><td style={cell}>{r.bit}</td><td style={cell}>{r.a}</td><td style={cell}>{r.b}</td><td style={cell}>{r.c}</td><td style={cell}>{r.cost}</td></tr>)}
          {bit !== null && <tr style={{ background: 'var(--surface2)', fontWeight: 600 }}><td style={cell}>{bit}</td><td style={cell}>{x}</td><td style={cell}>{y}</td><td style={cell}>{z}</td><td style={cell}>·</td></tr>}
        </tbody>
      </table>
      <p>Running total: <strong>{flips}</strong></p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Per bit:</strong> the positions are independent, so each one contributes its own cost.</p>
    <p><strong>Target 1:</strong> free only when a or b already has a 1; otherwise one flip is needed.</p>
    <p><strong>Target 0:</strong> each 1 in a or b must be cleared, one flip each.</p>
  </>} />
}
