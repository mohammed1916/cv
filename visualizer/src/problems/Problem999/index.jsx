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
    const stopIsPawn = step.outcome === 'pawn'
    return <section aria-label="Board with the rook's rays" style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', justifyItems: 'start', gap: 12, padding: 12, borderRadius: 8, background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div role="img" aria-label="Chessboard with the rook" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 36px)', gap: 2, width: 'max-content' }}>
          {board.flatMap((row, r) => [...row].map((ch, c) => {
            const key = `${r},${c}`
            const isRook = r === rr && c === rc
            const isStop = key === stop
            const onRay = rayKeys.has(key)
            const bg = (r + c) % 2 ? 'var(--surface2)' : 'var(--surface)'
            const border = isStop && stopIsPawn ? '2px solid var(--success)' : isStop ? '2px solid var(--error)' : onRay ? '2px solid var(--primary)' : '1px solid var(--border)'
            return <div key={key} data-cell={key} data-piece={ch} style={{
              width: 36, height: 36, borderRadius: 4, display: 'grid', placeItems: 'center', boxSizing: 'border-box',
              background: bg, color: 'var(--text)',
              fontWeight: isRook || isStop ? 700 : 400, border,
            }}>{ch === '.' ? '' : ch}</div>
          }))}
        </div>
        <p style={{ margin: 0, padding: 12, borderRadius: 8, width: '100%', boxSizing: 'border-box', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          Direction: <strong>{step.direction ? DIRECTION_LABEL[step.direction] : 'all four done'}</strong> · captures so far: <strong>{step.captures}</strong>
        </p>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Blue outlined squares are the current ray. A green outline marks a capturable pawn, and a red outline marks a piece that blocks the ray.</p>
      </div>
    </section>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
