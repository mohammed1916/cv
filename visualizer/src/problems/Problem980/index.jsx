import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '980',
  title: 'Unique Paths III',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with grid: rows of -1 (obstacle), 0 (empty), 1 (start) and 2 (end), at most 12 squares',
  url: 'https://leetcode.com/problems/unique-paths-iii/',
  complexity: 'Exponential in the number of empty squares in the worst case, since every walk is tried. The grid is capped at 12 squares here.',
  examples: [
    { label: 'Ring around the middle', input: JSON.stringify({ grid: [[1, 0, 0], [0, 0, 0], [0, 0, 2]] }) },
    { label: 'Open two-row board', input: JSON.stringify({ grid: [[1, 0, 0], [0, 0, 2]] }) },
    { label: 'Obstacle beside start', input: JSON.stringify({ grid: [[1, -1], [0, 2]] }) },
  ],
}

const CELL = 52

export default function Problem980() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const grid = run.input.grid
    const order = new Map(step.path.map((p, i) => [`${p[0]},${p[1]}`, i + 1]))
    const at = step.at ? `${step.at[0]},${step.at[1]}` : null
    return <section aria-label="Grid walk" style={{ display: 'grid', gap: 10 }}>
      <div role="img" aria-label="Grid with the current walk" style={{ display: 'grid', gridTemplateColumns: `repeat(${grid[0].length}, ${CELL}px)`, gap: 4, width: 'max-content' }}>
        {grid.flatMap((row, r) => row.map((v, c) => {
          const key = `${r},${c}`
          const inPath = order.has(key)
          const isAt = key === at
          const label = v === -1 ? '#' : v === 1 ? 'S' : v === 2 ? 'E' : order.get(key) ?? ''
          return <div key={key} data-cell={key} data-visited={inPath} style={{
            width: CELL, height: CELL, borderRadius: 6, display: 'grid', placeItems: 'center',
            border: `2px solid ${isAt ? 'var(--primary)' : 'var(--border)'}`,
            background: v === -1 ? 'var(--surface2)' : inPath ? 'var(--primary-glow)' : 'var(--surface)',
            color: v === -1 ? 'var(--text-muted)' : 'var(--text)', fontWeight: v === 1 || v === 2 ? 700 : 400,
          }}>{label}</div>
        }))}
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>Path so far: {step.path.map(p => `(${p[0]},${p[1]})`).join(' → ')}. Walks counted: {step.count}.</p>
      {step.remaining !== undefined && <p style={{ margin: 0, color: 'var(--text-muted)' }}>Empty squares still unvisited: {step.remaining}.</p>}
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Numbers mark the order of the current path. Shaded squares are on it. Backtracking frees the most recent square.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
