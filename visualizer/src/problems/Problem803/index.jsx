import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import PagedGrid from '../../components/shared/PagedGrid'
import IndexedSequence from '../../components/shared/IndexedSequence'
import { buildTrace, parseInput, code, python } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Input', description: 'Read the grid and the hit list.' },
    { id: 'remove', label: 'Remove hits', description: 'Apply every hit at once.' },
    { id: 'build', label: 'Union stable', description: 'Union bricks; the ceiling is a virtual node.' },
    { id: 'restore', label: 'Restore brick', description: 'Process hits backwards, putting a brick back.' },
    { id: 'skip', label: 'Skip empty', description: 'A hit on an empty cell dropped nothing.' },
    { id: 'merge', label: 'Merge and count', description: 'Compare ceiling-component size before and after.' },
    { id: 'done', label: 'Complete', description: 'Return the fallen counts.' },
  ],
  parse: parseInput, build: buildTrace, code, python, inputLabel: 'Object {grid, hits} (JSON)',
  url: 'https://leetcode.com/problems/bricks-falling-when-hit/',
  complexity: 'O(R*C + H) union-find operations, near-linear with path compression and union by size.',
  examples: [
    { label: 'Example 1', input: '{"grid":[[1,0,0,0],[1,1,1,0]],"hits":[[1,0]]}' },
    { label: 'Example 2', input: '{"grid":[[1,0,0,0],[1,1,0,0]],"hits":[[1,1],[1,0]]}' },
    { label: 'Empty-cell hit', input: '{"grid":[[1,1,1],[0,1,0],[0,1,0]],"hits":[[2,1],[0,2],[1,0],[1,1]]}' },
  ],
}
export default function BricksFallingWhenHit() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <PagedGrid label="Brick grid" rows={run.input.grid.length} columns={run.input.grid[0].length} cellAt={(r, c) => {
      const v = step.g[r][c], attached = step.attached[r][c], current = step.cell && step.cell[0] === r && step.cell[1] === c
      const label = current ? 'current hit' : v === 1 ? (attached ? 'stable' : 'loose') : v === 0 ? 'removed' : 'empty'
      return { value: v === -1 ? 0 : v, label, role: current ? 'active' : attached ? 'safe' : v === 1 ? 'loose' : '', color: attached ? '#16a34a' : v === 1 ? '#d97706' : undefined, detail: `${label}; stored value ${v}` }
    }} />
    <IndexedSequence label="Fallen bricks per hit" length={run.input.hits.length} active={step.hitIndex} valueAt={i => step.res[i]} roleAt={i => `(${run.input.hits[i].join(',')})`} />
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Why reverse:</strong> deleting bricks splits components, which union-find cannot do; adding bricks only merges them. When a brick returns, every newly ceiling-connected brick except the restored one is exactly what that hit had dropped.</p>
  </>} />
}
