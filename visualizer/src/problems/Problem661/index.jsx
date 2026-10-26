import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Image', description: 'Start with an empty output.' },
    { id: 'cell', label: 'Average cell', description: 'Average the neighbourhood that lies inside the image.' },
    { id: 'done', label: 'Complete', description: 'The smoothed image is ready.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Image (JSON array of rows)',
  url: 'https://leetcode.com/problems/image-smoother/',
  complexity: 'O(m·n) time and O(1) extra space beyond the output grid, since each neighbourhood has at most nine cells.',
  examples: [
    { label: 'Mixed', input: '[[1,1,1],[1,0,1],[1,1,1]]' },
    { label: 'Corners', input: '[[100,200,100],[200,50,200],[100,200,100]]' },
  ],
}

// Renders a grid of numbers; `active` marks the cell being averaged.
function Grid({ label, rows, active = null }) {
  return <div aria-label={label} style={{ overflowX: 'auto', marginTop: 8 }}>
    <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
      <tbody>
        {rows.map((row, r) => <tr key={r}>
          {row.map((value, c) => {
            const isActive = active && active.row === r && active.col === c
            return <td key={c} style={{ border: '1px solid var(--border)', width: 40, height: 32, textAlign: 'center',
              background: isActive ? 'var(--primary)' : 'var(--surface2)', color: isActive ? '#fff' : 'var(--text)' }}>{value}</td>
          })}
        </tr>)}
      </tbody>
    </table>
  </div>
}

export default function ImageSmoother() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Grid label="Input image" rows={run.input} active={{ row: step.row, col: step.col }} />
    <Grid label="Smoothed image" rows={step.phase === 'start' ? run.input.map(r => r.map(() => '·')) : step.out} />
    <output aria-label="Current cell">{step.count ? `Cell (${step.row}, ${step.col}): sum ${step.sum} over ${step.count} cells` : 'Ready'}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Edges:</strong> cells on the border average over fewer neighbours (6 on an edge, 4 in a corner), so the divisor is the count of cells actually inside the image.</p>
  </>} />
}
