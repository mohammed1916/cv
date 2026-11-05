import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { parseInput, buildTrace, code, python, phases } from './algorithm'

const definition = {
  number: '999',
  title: 'Available Captures for Rook',
  phases, parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with board: eight strings of eight characters, using R (rook), B (bishop), p (pawn) and . (empty)',
  url: 'https://leetcode.com/problems/available-captures-for-rook/',
  complexity: 'O(1) for an 8 x 8 board: at most 28 squares are looked at in four rays.',
  examples: [
    {
      label: 'Pawns in two directions',
      input: JSON.stringify({ board: ['........', '...p....', '...R...p', '........', '........', '...p....', '........', '........'] }),
    },
    {
      label: 'Bishop blocks one side',
      input: JSON.stringify({ board: ['........', '........', '..B.R.p.', '........', '........', '........', '........', '........'] }),
    },
    {
      label: 'Open board, one pawn',
      input: JSON.stringify({ board: ['R......p', '........', '........', '........', '........', '........', '........', '........'] }),
    },
  ],
}

const DIRECTION_LABEL = { down: 'down', up: 'up', right: 'right', left: 'left' }

export default function Problem999() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const board = run.input.board
    const [rr, rc] = run.rook
    const rayKeys = new Set(step.ray.map(([r, c]) => `${r},${c}`))
    const stop = step.stop ? `${step.stop[0]},${step.stop[1]}` : null
    return <section aria-label="Board with the rook's rays" style={{ display: 'grid', gap: 8 }}>
      <div role="img" aria-label="Chessboard with the rook" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 36px)', gap: 2, width: 'max-content' }}>
        {board.flatMap((row, r) => [...row].map((ch, c) => {
          const key = `${r},${c}`
          const isRook = r === rr && c === rc
          const isStop = key === stop
          const onRay = rayKeys.has(key)
          const bg = isStop && step.outcome === 'pawn' ? 'var(--primary)' : onRay ? 'var(--primary-glow)' : (r + c) % 2 ? 'var(--surface2)' : 'var(--surface)'
          return <div key={key} data-cell={key} data-piece={ch} style={{
            width: 36, height: 36, borderRadius: 4, display: 'grid', placeItems: 'center',
            background: bg, color: isStop && step.outcome === 'pawn' ? 'var(--on-primary)' : 'var(--text)',
            fontWeight: isRook ? 700 : 400, border: isStop ? '2px solid var(--primary)' : '1px solid var(--border)',
          }}>{ch === '.' ? '' : ch}</div>
        }))}
      </div>
      <p style={{ margin: 0, color: 'var(--text)' }}>
        Direction: <strong>{step.direction ? DIRECTION_LABEL[step.direction] : 'all four done'}</strong> · captures so far: <strong>{step.captures}</strong>
      </p>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>Shaded squares are the current ray. A ray stops at the first piece it meets.</p>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
