import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('688 official examples', () => {
  assert.ok(Math.abs(buildTrace({ n: 3, k: 2, row: 0, column: 0 }).result - 0.0625) < 1e-9)
  assert.ok(Math.abs(buildTrace({ n: 1, k: 3, row: 0, column: 0 }).result - 0) < 1e-9)
})

// Oracle: enumerate all 8^k move sequences and count those that stay on the board.
test('688 small boards match full enumeration of move sequences', () => {
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]]
  function count(n, r, c, k) {
    if (k === 0) return 1
    let total = 0
    for (const [dr, dc] of moves) {
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) total += count(n, nr, nc, k - 1)
    }
    return total
  }
  for (let n = 1; n <= 4; n++) for (let k = 0; k <= 4; k++) for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    const expected = count(n, r, c, k) / 8 ** k
    assert.ok(Math.abs(buildTrace({ n, k, row: r, column: c }).result - expected) < 1e-9, JSON.stringify({ n, k, r, c }))
  }
})

test('688 rejects a start square off the board', () => {
  assert.throws(() => parseInput('{"n":2,"k":1,"row":2,"column":0}'))
})
