import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases, ringCells } from './algorithm'

const LAYER_COLOURS = ['var(--primary)', 'var(--success)', 'var(--text-muted)']

const definition = {
  number: '1914',
  phases,
  parse: parseInput,
  build: buildTrace,
  code,
  python,
  inputLabel: 'JSON object with grid (even rows and columns) and k (e.g. {"grid":[[1,2],[3,4]],"k":1})',
  url: 'https://leetcode.com/problems/cyclically-rotating-a-grid/',
  complexity: 'O(m·n) time: each cell is moved once per layer pass, with k taken modulo the ring length.',
  examples: [
    { label: 'Two by two', input: '{"grid":[[1,2],[3,4]],"k":1}' },
    { label: 'Four by four', input: '{"grid":[[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]],"k":1}' },
    { label: 'Zero shifts', input: '{"grid":[[1,2],[3,4]],"k":0}' },
    { label: 'Equal values', input: '{"grid":[[5,5],[5,5]],"k":3}' },
    { label: 'Tall grid with many shifts', input: '{"grid":[[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]],"k":1000}' },
    { label: 'Long run: 6 by 6 generated values', input: '{"grid":[[210,660,211,264,508,852],[509,911,612,623,311,19],[487,394,935,58,682,527],[160,361,681,930,288,214],[577,552,526,380,58,361],[137,86,105,489,363,879]],"k":250}' },
  ],
}

export default function Problem1914Visualizer() {
  return <AlgorithmWorkspace
    definition={definition}
    renderVisual={({ run, step }) => {
      const m = run.input.grid.length, n = run.input.grid[0].length
      const ringOf = new Map()
      for (let layer = 0; layer < Math.min(m, n) / 2; layer++) ringCells(m, n, layer).forEach(([r, c]) => ringOf.set(`${r},${c}`, layer))
      const active = new Set((step.cells || []).map(([r, c]) => `${r},${c}`))
      return <>
        <div aria-label="Grid" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${n}, 52px)`, gap: 4 }}>
          {step.grid.flatMap((row, r) => row.map((v, c) => {
            const layer = ringOf.get(`${r},${c}`)
            const on = active.has(`${r},${c}`)
            return <div key={`${r}-${c}`} style={{ height: 46, display: 'grid', placeItems: 'center', borderRadius: 6, fontWeight: 600,
              border: on ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: layer === undefined ? 'var(--surface2)' : `color-mix(in srgb, ${LAYER_COLOURS[layer % 3]} 16%, var(--surface2))`,
              color: 'var(--text)' }}>{v}</div>
          }))}
        </div>
        <p>Each colour is one layer (ring). Outlined cells are the ring being rotated in this step.</p>
        {step.shift !== null && step.layer >= 0 && <p>Shift for this ring: <strong>{step.shift}</strong></p>}
      </>
    }}
    renderReasoning={({ step }) => <p>{step.message}</p>}
  />
}
