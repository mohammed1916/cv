import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python } from './algorithm'

const definition = {
  number: '1274',
  phases: [
    { id: 'start', label: 'Grid', description: 'Start with the full grid.' },
    { id: 'empty', label: 'Empty', description: 'The rectangle has no area.' },
    { id: 'oracle', label: 'Oracle', description: 'The oracle says no ships are inside.' },
    { id: 'split', label: 'Split', description: 'Halve the rectangle along its longer side.' },
    { id: 'cell', label: 'Cell', description: 'A single cell with a ship counts as 1.' },
    { id: 'done', label: 'Result', description: 'Report the total.' },
  ],
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with size (grid side) and ships: [[x, y], ...]',
  url: 'https://leetcode.com/problems/number-of-ships-in-a-rectangle/',
  complexity: 'Each ship causes at most O(log size) splits along each path, so the oracle is called a small number of times per ship. The visualization caps the grid at 8 by 8.',
  examples: [
    { label: 'Example', input: '{"size":4,"ships":[[0,0],[2,3],[3,1]]}' },
    { label: 'Empty grid', input: '{"size":3,"ships":[]}' },
  ],
}

export default function NumberOfShipsInARectangle() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { size, ships } = run.input
    const rect = step.rect ?? null
    const inRect = (r, c) => rect !== null && r >= rect[0] && r <= rect[2] && c >= rect[1] && c <= rect[3]
    const hasShip = (r, c) => ships.some(([x, y]) => x === r && y === c)
    return <>
      <div aria-label="Grid with the current rectangle" role="img" style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${size}, 34px)`, gap: 3, fontFamily: 'monospace' }}>
        {Array.from({ length: size * size }, (_, k) => {
          const r = Math.floor(k / size)
          const c = k % size
          const ship = hasShip(r, c)
          const inside = inRect(r, c)
          return <div key={k} data-cell={`${r},${c}`} style={{
            width: 34, height: 34, boxSizing: 'border-box', display: 'grid', placeItems: 'center', color: 'var(--text)',
            border: inside ? '2px solid var(--text)' : '1px solid var(--border)',
            background: inside ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface2)',
          }}>{ship ? '●' : ''}</div>
        })}
      </div>
      <p>{rect ? `Rectangle rows ${rect[0]} to ${rect[2]}, columns ${rect[1]} to ${rect[3]}.` : 'The whole grid.'}</p>
      <ul aria-label="Ships found">{step.state.map((line, index) => <li key={index}>{line}</li>)}</ul>
      <output aria-label="Current step">{step.message}</output>
    </>
  }} renderReasoning={() => <>
    <p>The oracle only answers whether a rectangle contains any ship, so the search narrows down by halving rectangles that report ships.</p>
    <p>An empty answer prunes a whole region at once, which is why the number of oracle calls stays small when ships are sparse.</p>
  </>} />
}
