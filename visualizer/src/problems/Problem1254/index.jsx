import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  number: '1254',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Grid of 0 (land) and 1 (water) as JSON rows',
  url: 'https://leetcode.com/problems/number-of-closed-islands/',
  complexity: 'O(m * n) time and space: every cell is reached by at most one flood, and edge floods are not repeated.',
  examples: [
    { label: 'Lake inside', input: '[[1,1,1,1],[1,0,0,1],[1,0,1,1],[1,1,1,1]]' },
    { label: 'Touches edge', input: '[[0,0,1],[1,0,1],[1,1,0]]' },
    { label: 'Two enclosed', input: '[[1,1,1,1,1],[1,0,1,0,1],[1,1,1,0,1],[1,0,0,0,1],[1,1,1,1,1]]' },
  ],
}

export default function ClosedIslands() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { grid, reach, focus } = step.snapshot
    return <>
      <div aria-label="Grid" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${grid[0].length}, 34px)`, gap: 3, fontFamily: 'monospace' }}>
        {grid.flatMap((row, r) => row.map((cell, c) => {
          const isFocus = focus && focus[0] === r && focus[1] === c
          const water = cell === 1
          const edge = r === 0 || c === 0 || r === grid.length - 1 || c === row.length - 1
          const background = water ? 'var(--surface2)' : reach[r][c] ? (edge ? 'color-mix(in srgb, var(--primary) 25%, transparent)' : 'color-mix(in srgb, var(--primary) 35%, transparent)') : 'var(--surface2)'
          return <div key={`${r}-${c}`} data-cell={`${r},${c}`} style={{
            width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background, color: water ? 'var(--text)' : 'var(--text)', border: isFocus ? '2px solid var(--text)' : '1px solid var(--border)',
          }}>{water ? '≈' : edge && !reach[r][c] ? 'E' : ''}</div>
        }))}
      </div>
      <p>Dark cells are water. Green cells are land reached by a flood (light green touches the edge). Yellow land is not reached yet. {run.input.length} rows in this grid.</p>
    </>
  }} renderReasoning={() => <>
    <p><strong>Edge first:</strong> land on the outer ring can never be enclosed, and neither can land connected to it. Flooding from the edge marks all of that land before the interior is examined.</p>
    <p><strong>Count what remains:</strong> any land cell left unmarked belongs to a component that never reaches the edge. Each such flood is one closed island.</p>
  </>} />
}
