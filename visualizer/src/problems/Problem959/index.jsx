import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '959',
  title: 'Regions Cut By Slashes',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with a grid: a list of square rows made of /, backslash and spaces',
  url: 'https://leetcode.com/problems/regions-cut-by-slashes/',
  complexity: 'O(n^2) cells and triangles, with near-constant work per union in the disjoint-set forest.',
  examples: [
    { label: 'Diagonal slashes', input: JSON.stringify({ grid: ['  /', ' / ', '/  '] }) },
    { label: 'Open board', input: JSON.stringify({ grid: ['   ', '   ', '   '] }) },
    { label: 'Backslashes', input: JSON.stringify({ grid: ['\\ ', ' \\'] }) },
  ],
}

// Four triangles per cell, in order top, right, bottom, left. Each triangle is coloured by its group root.
const TRIANGLES = [
  [[0, 0], [1, 0], [0.5, 0.5]],
  [[1, 0], [1, 1], [0.5, 0.5]],
  [[1, 1], [0, 1], [0.5, 0.5]],
  [[0, 1], [0, 0], [0.5, 0.5]],
]

function rootOf(parent, x) {
  let root = x
  while (parent[root] !== root) root = parent[root]
  return root
}

function Cell({ ch, base, parent, active }) {
  const size = 84
  return <svg width={size} height={size} viewBox="-0.05 -0.05 1.1 1.1" role="img" aria-label={`cell ${ch === ' ' ? 'open' : ch}`}
    style={{ outline: active ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: 4 }}>
    {TRIANGLES.map((points, k) => {
      const root = rootOf(parent, base + k)
      return <polygon key={k} points={points.map(p => p.join(',')).join(' ')}
        fill={`hsl(${(root * 137) % 360} 70% 78%)`} stroke="var(--border)" strokeWidth="0.02" />
    })}
    {ch !== ' ' && <line x1={0} y1={ch === '/' ? 1 : 0} x2={1} y2={ch === '/' ? 0 : 1} stroke="var(--text)" strokeWidth="0.06" />}
  </svg>
}

export default function Problem959() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ step, run }) => {
    const grid = run.input.grid
    const n = grid.length
    const groups = new Set(step.parent.map((_, i) => rootOf(step.parent, i))).size
    return <section aria-label="Grid of cells split into triangles" style={{ display: 'grid', gap: 10 }}>
      <p style={{ margin: 0, color: 'var(--text)' }}>Groups now: <strong>{groups}</strong>. Triangles with the same colour are already joined.</p>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, 84px)`, gap: 6, width: 'max-content' }}>
        {grid.flatMap((row, r) => [...row].map((ch, c) => <div key={`${r}-${c}`} style={{ display: 'grid', justifyItems: 'center', gap: 2 }}>
          <Cell ch={ch} base={4 * (r * n + c)} parent={step.parent} active={step.cell && step.cell[0] === r && step.cell[1] === c} />
          <small style={{ color: 'var(--text-muted)' }}>({r},{c})</small>
        </div>))}
      </div>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>The line in each cell is the slash. A triangle is only merged with a neighbour when no line separates them.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
