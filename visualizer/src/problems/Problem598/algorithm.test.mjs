import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('598 official examples', () => {
  assert.equal(buildTrace({ m: 3, n: 3, ops: [[2, 2], [3, 3]] }).result, 4)
  assert.equal(buildTrace({ m: 3, n: 3, ops: [[2, 2], [3, 3], [3, 3], [3, 3], [2, 2], [3, 3], [3, 3], [3, 3], [2, 2], [3, 3], [3, 3], [3, 3]] }).result, 4)
  assert.equal(buildTrace({ m: 3, n: 3, ops: [] }).result, 9)
})

test('598 small grids match an explicit matrix simulation', () => {
  for (let m = 1; m <= 4; m++) for (let n = 1; n <= 4; n++) {
    for (let seed = 0; seed < 40; seed++) {
      const ops = Array.from({ length: seed % 5 }, (_, i) => [1 + ((seed + i * 3) % m), 1 + ((seed * 2 + i) % n)])
      const grid = Array.from({ length: m }, () => Array(n).fill(0))
      for (const [a, b] of ops) for (let r = 0; r < a; r++) for (let c = 0; c < b; c++) grid[r][c]++
      const max = Math.max(...grid.flat())
      const expected = grid.flat().filter(v => v === max).length
      assert.equal(buildTrace({ m, n, ops }).result, expected, JSON.stringify({ m, n, ops }))
    }
  }
})

test('598 rejects operations outside the matrix', () => {
  assert.throws(() => parseInput('{"m":2,"n":2,"ops":[[3,1]]}'))
})
