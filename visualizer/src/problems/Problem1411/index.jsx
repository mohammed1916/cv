import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1411',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Number of rows (integer)',
  url: 'https://leetcode.com/problems/number-of-ways-to-paint-n-3-grid/',
  complexity: 'O(n) time and O(1) space: only two category totals are kept from row to row.',
  examples: [
    { label: 'One row', input: '1' },
    { label: 'Two rows', input: '2' },
    { label: 'Five rows', input: '5' },
  ],
}

export default function PaintThreeColumnGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => {
    const s = step.snapshot
    return <>
      <table aria-label="Row categories" style={{ fontFamily: 'monospace', borderCollapse: 'collapse' }}>
        <thead><tr><th style={{ padding: '4px 10px' }}>row</th><th style={{ padding: '4px 10px' }}>ABA rows</th><th style={{ padding: '4px 10px' }}>ABC rows</th></tr></thead>
        <tbody><tr>
          <td style={{ padding: '4px 10px' }}>{s.row}</td>
          <td style={{ padding: '4px 10px' }}>{s.aba}</td>
          <td style={{ padding: '4px 10px' }}>{s.abc}</td>
        </tr></tbody>
      </table>
      {s.nextAba !== undefined && <p>Next row: ABA {s.nextAba}, ABC {s.nextAbc}.</p>}
      {s.total !== undefined && <p>Total: {s.total}</p>}
    </>
  }} renderReasoning={() => <>
    <p><strong>Two row categories.</strong> A row either repeats its first color in the third column (ABA) or uses three different colors (ABC). The category is enough to count what can follow it.</p>
    <p><strong>Transitions.</strong> Each category has a fixed number of compatible next rows in each category, so the whole count is a two-number recurrence.</p>
  </>} />
}
