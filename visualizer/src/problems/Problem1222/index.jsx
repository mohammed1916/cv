import AlgorithmWorkspace from '../../components/shared/AlgorithmWorkspace'
import { buildTrace, parseInput, code, python, phases } from './algorithm'

const definition = {
  phases,
  parse: parseInput, build: buildTrace, code, python,
  inputLabel: 'Object with queens and king (JSON)',
  complexity: 'O(1) time for a fixed 8 by 8 board: at most eight rays of at most seven steps.',
  examples: [
    { label: 'Near queens', input: '{"queens":[[0,3],[2,3],[6,3],[3,0],[3,6],[1,1],[0,0],[5,5],[2,6]],"king":[3,3]}' },
    { label: 'Corner king', input: '{"queens":[[0,5],[6,0],[4,4]],"king":[0,0]}' },
    { label: 'No attack', input: '{"queens":[[1,2],[2,5],[5,6]],"king":[3,3]}' },
    { label: 'Row', input: '{"queens":[[4,2],[4,0]],"king":[4,6]}' },
  ],
}

export default function QueensAttackKing() {
  return <AlgorithmWorkspace definition={definition} renderVisual={({ run, step }) => {
    const { queens, king } = run.input
    const { cell, direction, found } = step.snapshot
    const isQueen = (r, c) => queens.some(([qr, qc]) => qr === r && qc === c)
    const isFound = (r, c) => found.some(([fr, fc]) => fr === r && fc === c)
    return <div aria-label="Board" role="img" style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 32px)', width: 'max-content', fontFamily: 'monospace' }}>
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8)
        const c = i % 8
        const isKing = king[0] === r && king[1] === c
        const isCell = cell && cell[0] === r && cell[1] === c
        return <div key={i} data-square={`${r},${c}`} style={{
          width: 32, height: 32, boxSizing: 'border-box', display: 'grid', placeItems: 'center',
          border: '1px solid var(--border)',
          background: isFound(r, c) ? 'color-mix(in srgb, var(--primary) 40%, transparent)' : isCell ? 'var(--surface2)' : 'transparent',
        }}>{isKing ? 'K' : isQueen(r, c) ? 'Q' : ''}</div>
      })}
      <output aria-label="Current ray" style={{ gridColumn: '1 / -1', marginTop: 8 }}>{direction ? `Ray direction (${direction[0]},${direction[1]})` : 'Choose the next ray'}</output>
    </div>
  }} renderReasoning={({ step }) => <p>{step.message}</p>} />
}
