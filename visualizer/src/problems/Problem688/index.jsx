import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code } from './algorithm'

const definition = {
  phases: [
    { id: 'start', label: 'Start', description: 'All probability on the start square.' },
    { id: 'move', label: 'Move', description: 'Each square spreads 1/8 to each knight move that stays on the board.' },
    { id: 'done', label: 'Complete', description: 'Total probability still on the board.' },
  ],
  parse: parseInput, build: buildTrace, code, inputLabel: 'Board and knight (JSON object with n, k, row and column)',
  url: 'https://leetcode.com/problems/knight-probability-in-chessboard/',
  complexity: 'O(k · n²) time and O(n²) space.',
  examples: [
    { label: 'Three moves', input: '{"n":3,"k":2,"row":0,"column":0}' },
    { label: 'One move', input: '{"n":1,"k":3,"row":0,"column":0}' },
  ],
}

export default function KnightProbability() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => <>
    <div aria-label="Probability board" style={{ display: 'grid', gridTemplateColumns: `repeat(${run.input.n}, minmax(48px, 1fr))`, gap: 3, maxWidth: 480 }}>
      {step.board.flatMap((row, r) => row.map((p, c) => {
        const strong = Math.min(1, p * 4)
        return <div key={`${r}-${c}`} style={{ height: 48, display: 'grid', placeItems: 'center', fontFamily: 'monospace', fontSize: '.72rem', borderRadius: 4,
          border: r === run.input.row && c === run.input.column ? '2px solid var(--primary)' : '1px solid var(--border)',
          background: `color-mix(in srgb, var(--primary) ${Math.round(strong * 70)}%, var(--surface2))` }}>{p.toFixed(3)}</div>
      }))}
    </div>
    <output aria-label="Total probability">Move {step.step} of {run.input.k} · on board {step.board.flat().reduce((a, b) => a + b, 0).toFixed(4)}</output>
  </>} renderReasoning={({ step }) => <>
    <p>{step.message}</p>
    <p><strong>Probability mass:</strong> a move that would leave the board contributes nothing, so the total only shrinks.</p>
  </>} />
}
