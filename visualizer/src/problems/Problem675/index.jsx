import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'Begin at the top-left cell.' },
    { id: 'walk', label: 'Walk and cut', description: 'Take the shortest route to the next tree in height order.' },
    { id: 'blocked', label: 'Blocked', description: 'No route reaches the next tree.' },
    { id: 'done', label: 'Complete', description: 'Every tree has been cut.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Forest grid (JSON array of rows)',
  url: 'https://leetcode.com/problems/cut-off-trees-for-golf-event/',
  complexity: 'O(T · (m·n)) time for T trees on an m×n grid, since each leg is a BFS. The order is fixed by sorting heights.',
  examples: [
    { label: 'Three trees', input: '[[1,2,3],[0,0,4],[7,6,5]]' },
    { label: 'Blocked', input: '[[1,2,3],[0,0,0],[7,6,5]]' },
    { label: 'Already there', input: '[[2,3,4],[0,0,5],[8,7,6]]' },
  ],
}

export default function CutOffTrees() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const m = run.input.length, n = run.input[0].length
    const cells = []
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      const v = run.input[r][c]
      const isHere = step.from && step.from[0] === r && step.from[1] === c
      const isTarget = step.to && step.to[0] === r && step.to[1] === c
      cells.push(<div key={`${r}-${c}`} style={{ height: 40, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '.8rem', border: '1px solid var(--border)', borderRadius: 4,
        background: isHere ? 'var(--primary)' : isTarget ? 'var(--surface)' : v === 0 ? 'var(--code-bg)' : 'var(--surface2)', color: isHere ? '#fff' : 'var(--text)' }}>{v === 0 ? '■' : v === 1 ? '·' : v}</div>)
    }
    return <>
      <div aria-label="Forest" style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(40px, 1fr))`, gap: 4, maxWidth: 480 }}>{cells}</div>
      <output aria-label="Steps">Steps so far: {step.phase === 'done' ? run.result : step.steps ?? 0} · trees cut {step.cut}</output>
    </>
  }} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Order matters:</strong> trees must be cut shortest first; each leg uses BFS on open cells (not blocked, not yet a cut tree's wall).</p>
  </>} />
}
