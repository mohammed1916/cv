import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

function Grid({ label, rows, current = null }) {
  return <div aria-label={label} style={{ overflowX: 'auto', marginTop: 8 }}>
    <table style={{ borderCollapse: 'collapse', fontFamily: 'monospace' }}>
      <tbody>{rows.map((row, r) => <tr key={r}>{row.map((v, c) => {
        const isCurrent = current && current[0] === r && current[1] === c
        return <td key={c} style={{ border: '1px solid var(--border)', width: 40, height: 32, textAlign: 'center',
          background: isCurrent ? 'var(--primary)' : 'var(--surface2)', color: isCurrent ? '#fff' : 'var(--text)' }}>{v}</td>
      })}</tr>)}</tbody>
    </table>
  </div>
}

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the start pixel.' },
    { id: 'paint', label: 'Paint neighbour', description: 'Repaint a same-coloured neighbour and queue it.' },
    { id: 'done', label: 'Complete', description: 'Return the repainted image.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Image and start (JSON object with image, sr, sc and color)',
  url: 'https://leetcode.com/problems/flood-fill/',
  complexity: 'O(m · n) time and O(m · n) space for the queue and the image copy.',
  examples: [
    { label: 'Classic', input: '{"image":[[1,1,1],[1,1,0],[1,0,1]],"sr":1,"sc":1,"color":2}' },
    { label: 'Same colour', input: '{"image":[[0,0,0],[0,0,0]],"sr":0,"sc":0,"color":0}' },
  ],
}

export default function FloodFill() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <Grid label="Filled image" rows={step.out} current={step.current} />
    <output aria-label="Status">{step.phase === 'done' ? `Done: ${step.result.flat().filter(v => v === run.input.color).length} pixels show ${run.input.color}` : 'Filling…'}</output>
  </>} renderReasoning={({ run, step }) => <>
    <p>{step.message}</p>
    <p><strong>Region:</strong> only pixels with the original colour are repainted; repainting before queuing stops a pixel being added twice.</p>
    <p>Target colour {run.input.color}.</p>
  </>} />
}
