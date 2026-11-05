import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: a pawn is capturable when it shares the rook's row or column and every square between them
// is empty.
function bruteCaptures(board) {
  let rr = -1, rc = -1
  board.forEach((row, r) => [...row].forEach((ch, c) => { if (ch === 'R') { rr = r; rc = c } }))
  let count = 0
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if (board[r][c] !== 'p') continue
    if (r === rr) {
      const [lo, hi] = [Math.min(c, rc), Math.max(c, rc)]
      let clear = true
      for (let x = lo + 1; x < hi; x++) if (board[r][x] !== '.') clear = false
      if (clear) count++
    } else if (c === rc) {
      const [lo, hi] = [Math.min(r, rr), Math.max(r, rr)]
      let clear = true
      for (let y = lo + 1; y < hi; y++) if (board[y][c] !== '.') clear = false
      if (clear) count++
    }
  }
  return count
}

test('999 rook captures match the line-of-sight oracle', () => {
  const boards = [
    ['........', '...p....', '...R...p', '........', '........', '...p....', '........', '........'],
    ['........', '.p......', 'pRp.....', '........', '........', '........', '........', '........'],
    ['........', '........', '..B.R.p.', '........', '........', '........', '........', '........'],
    ['R.......', '........', '........', '........', '........', '........', '........', '.......p'],
    ['........', '........', '........', '...R....', '........', '....p...', '........', '........'],
    ['p.p.p.p.', '.p.p.p.p', 'p.p.R.p.', '.p.p.p.p', 'p.p.p.p.', '.p.p.p.p', 'p.p.p.p.', '.p.p.p.p'],
  ]
  for (const board of boards) {
    const run = buildTrace(parseInput(JSON.stringify({ board })))
    assert.equal(run.result, bruteCaptures(board), board.join('/'))
  }
})

test('999 requires exactly one rook', () => {
  assert.throws(() => parseInput('{"board":["........","........","........","........","........","........","........","........"]}'))
})
