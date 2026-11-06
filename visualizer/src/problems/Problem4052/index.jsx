import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'row', label: 'Rows', description: 'Rotate each row left by its shift.' },
    { id: 'column', label: 'Columns', description: 'Rotate each column up by its shift, using the shifted rows.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid and shifts (JSON object with grid, rowShift and colShift)',
  url: 'https://leetcode.com/problems/cyclically-shift-rows-and-columns/',
  complexity: 'O(n²) time and O(n²) space. The visualization caps the grid at 10 by 10.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,2],[3,4]],"rowShift":[1,0],"colShift":[0,1]}' },
    { label: 'Example 2', input: '{"grid":[[1,2,3],[4,5,6],[7,8,9]],"rowShift":[1,2,0],"colShift":[2,2,1]}' },
  ],
}

const cellStyle = (on, extra = {}) => ({
  padding: '0.35rem 0.55rem', textAlign: 'center', minWidth: '2.2rem',
  border: '1px solid var(--border)',
  background: on ? 'var(--primary)' : 'var(--surface2)', color: on ? 'var(--surface)' : 'var(--text)', ...extra,
})

function GridPanel({ title, rows, mode, index, note }) {
  const n = rows.length
  return <figure style={{ margin: 0 }}>
    <figcaption style={{ color: 'var(--text)', marginBottom: '0.35rem' }}>{title}</figcaption>
    <table aria-label={title} style={{ borderCollapse: 'collapse' }}>
      <tbody>{rows.map((row, i) => <tr key={i}>{row.map((v, j) => {
        const hit = mode === 'row' ? i === index : mode === 'column' ? j === index : false
        return <td key={j} style={cellStyle(hit)}>{v}</td>
      })}</tr>)}</tbody>
    </table>
    <p style={{ color: 'var(--text-muted, var(--text))', fontSize: '0.85rem' }}>{note} ({n}×{n})</p>
  </figure>
}

export default function CyclicallyShiftGrid() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step }) => <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
    <GridPanel title="After row shifts" rows={step.rows} mode={step.phase === 'row' ? 'row' : 'none'} index={step.index}
      note={step.phase === 'row' ? `Row ${step.index} (highlighted) moves left by its shift.` : 'Rows are final; each row has been rotated left.'} />
    {step.phase === 'column' && <GridPanel title="After column shifts" rows={step.grid} mode="column" index={step.index}
      note={`Column ${step.index} (highlighted) moves up, reading the rotated rows.`} />}
    <p style={{ color: 'var(--text)', width: '100%' }}>{step.message}</p>
  </div>} renderReasoning={() => <>
    <p>The row shifts run first and change each row in place. The column shifts then read from the rotated rows, so their order matters.</p>
    <p>A left shift by s takes the element at index j + s, and an upward shift takes the element at row i + s.</p>
  </>} />
}
