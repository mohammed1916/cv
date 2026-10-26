import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, flatten } from './algorithm.js'

const solve = b => buildTrace(parseInput(JSON.stringify(b))).result
// Oracle: Bellman-Ford style relaxation to a fixpoint.
function oracle(board) {
  const cells = flatten(board), total = board.length ** 2
  const d = new Array(total + 1).fill(Infinity); d[1] = 0
  for (let changed = true; changed;) {
    changed = false
    for (let s = 1; s <= total; s++) if (d[s] < Infinity) for (let k = 1; k <= 6 && s + k <= total; k++) {
      const t = cells[s + k] === -1 ? s + k : cells[s + k]
      if (d[s] + 1 < d[t]) { d[t] = d[s] + 1; changed = true }
    }
  }
  return d[total] === Infinity ? -1 : d[total]
}
test('official examples', () => {
  assert.equal(solve([[-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, -1, -1, -1, -1, -1], [-1, 35, -1, -1, 13, -1], [-1, -1, -1, -1, -1, -1], [-1, 15, -1, -1, -1, -1]]), 4)
  assert.equal(solve([[-1, -1], [-1, 3]]), 1)
})
test('flatten zigzags', () => {
  assert.deepEqual(flatten([[7, 8, 9], [4, 5, 6], [-1, 2, 3]]).slice(1), [-1, 2, 3, 6, 5, 4, 7, 8, 9])
})
test('matches relaxation oracle on random boards', () => {
  let seed = 11
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(6)
    const b = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd(3) === 0 ? 1 + rnd(n * n) : -1))
    b[n - 1][0] = -1
    assert.equal(solve(b), oracle(b), JSON.stringify(b))
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('[[-1,-1],[-1,3]]')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('[[-1,2],[3,1]]'))
  assert.throws(() => parseInput('[[-1]]'))
  assert.throws(() => parseInput('[[-1,9],[-1,-1]]'))
})
