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
    { label: "One cell", input: "{\"grid\":[[7]],\"rowShift\":[0],\"colShift\":[0]}" },
    { label: "Equal values", input: "{\"grid\":[[5,5],[5,5]],\"rowShift\":[1,1],\"colShift\":[0,0]}" },
    { label: "Largest grid and shifts", input: "{\"grid\":[[1,100,1,100,1,100,1,100,1,100],[100,1,100,1,100,1,100,1,100,1],[1,100,1,100,1,100,1,100,1,100],[100,1,100,1,100,1,100,1,100,1],[1,100,1,100,1,100,1,100,1,100],[100,1,100,1,100,1,100,1,100,1],[1,100,1,100,1,100,1,100,1,100],[100,1,100,1,100,1,100,1,100,1],[1,100,1,100,1,100,1,100,1,100],[100,1,100,1,100,1,100,1,100,1]],\"rowShift\":[9,8,7,6,5,4,3,2,1,0],\"colShift\":[9,9,9,9,9,9,9,9,9,9]}" },
    { label: "Long run: ten by ten grid", input: "{\"grid\":[[10,56,69,81,16,63,69,73,30,72],[85,70,20,37,46,46,13,9,61,71],[86,36,77,96,2,14,42,57,54,40],[66,14,87,35,29,21,41,40,44,39],[64,52,38,65,14,58,38,42,6,5],[24,81,86,69,70,87,20,37,82,83],[24,22,41,81,84,84,89,18,9,14],[87,97,18,51,51,29,12,40,38,20],[3,74,17,83,37,59,12,39,47,32],[31,3,24,1,10,99,9,71,4,12]],\"rowShift\":[8,9,0,7,6,6,4,5,3,1],\"colShift\":[3,7,4,6,0,7,3,3,8,3]}" },
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
