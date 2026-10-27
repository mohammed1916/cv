import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (a, b, c, d, e, f) => buildTrace(parseInput(JSON.stringify({ a, b, c, d, e, f }))).result

test('3001 rook captures directly on a line', () => {
  assert.equal(solve(5, 3, 3, 4, 5, 2), 1)
})

test('3001 two moves when no piece lines up', () => {
  assert.equal(solve(1, 1, 8, 8, 2, 3), 2)
})

test('3001 the bishop blocks the rook', () => {
  // Rook (1,1), bishop (1,4), queen (1,8): the bishop sits between them, so the rook cannot capture,
  // and the bishop is not on a diagonal with the queen.
  assert.equal(solve(1, 1, 1, 4, 1, 8), 2)
})

test('3001 rejects shared squares', () => {
  assert.throws(() => parseInput('{"a":1,"b":1,"c":1,"d":1,"e":2,"f":3}'))
  assert.throws(() => parseInput('{"a":0,"b":1,"c":1,"d":1,"e":2,"f":3}'))
})

// Independent oracle: search the moves. A move slides a piece along its lines and stops at other pieces;
// landing on the queen is a capture. Minimum moves is 1 if a capture exists now, else 2 if some quiet move
// creates a capture. Deeper search is never needed for this board.
const DIRS = { rook: [[1, 0], [-1, 0], [0, 1], [0, -1]], bishop: [[1, 1], [1, -1], [-1, 1], [-1, -1]] }
function movesFrom(from, kind, other, queen) {
  const out = []
  for (const [dr, dc] of DIRS[kind]) {
    for (let s = 1; ; s++) {
      const r = from[0] + s * dr
      const col = from[1] + s * dc
      if (r < 1 || r > 8 || col < 1 || col > 8) break
      if (r === other[0] && col === other[1]) break
      if (r === queen[0] && col === queen[1]) { out.push({ to: [r, col], capture: true }); break }
      out.push({ to: [r, col], capture: false })
    }
  }
  return out
}
function oracle(a, b, c, d, e, f) {
  const rook = [a, b]
  const bishop = [c, d]
  const queen = [e, f]
  if (movesFrom(rook, 'rook', bishop, queen).some(m => m.capture)) return 1
  if (movesFrom(bishop, 'bishop', rook, queen).some(m => m.capture)) return 1
  for (const m of movesFrom(rook, 'rook', bishop, queen)) {
    if (m.capture) continue
    if (movesFrom(bishop, 'bishop', m.to, queen).some(x => x.capture) || movesFrom(m.to, 'rook', bishop, queen).some(x => x.capture)) return 2
  }
  for (const m of movesFrom(bishop, 'bishop', rook, queen)) {
    if (m.capture) continue
    if (movesFrom(rook, 'rook', m.to, queen).some(x => x.capture) || movesFrom(m.to, 'bishop', rook, queen).some(x => x.capture)) return 2
  }
  return Infinity
}

test('3001 random placements match move search', () => {
  let seed = 3001
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const cells = new Set()
    while (cells.size < 3) cells.add(`${1 + rnd(8)},${1 + rnd(8)}`)
    const [r1, b1, r2, b2, r3, b3] = [...cells].flatMap(s => s.split(',').map(Number))
    assert.equal(solve(r1, b1, r2, b2, r3, b3), oracle(r1, b1, r2, b2, r3, b3), JSON.stringify([r1, b1, r2, b2, r3, b3]))
  }
})
