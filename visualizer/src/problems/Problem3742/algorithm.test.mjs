import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (grid, k) => buildTrace(parseInput(JSON.stringify({ grid, k }))).result

test('3742 official examples', () => {
  assert.equal(solve([[0, 1], [2, 0]], 1), 2)
  assert.equal(solve([[0, 1], [1, 2]], 1), -1)
})

test('3742 a single cell scores 0', () => {
  assert.equal(solve([[0]], 0), 0)
})

test('3742 the top-left cell must be 0', () => {
  assert.throws(() => parseInput('{"grid":[[1]],"k":1}'))
})

// Independent oracle: enumerate every right/down path and check its cost and score directly.
function oracle(grid, k) {
  const m = grid.length, n = grid[0].length
  let best = -1
  const walk = (r, c, cost, score) => {
    const v = grid[r][c]
    const nc = cost + (v > 0 ? 1 : 0), ns = score + v
    if (r === m - 1 && c === n - 1) { if (nc <= k) best = Math.max(best, ns); return }
    if (r + 1 < m) walk(r + 1, c, nc, ns)
    if (c + 1 < n) walk(r, c + 1, nc, ns)
  }
  walk(0, 0, 0, 0)
  return best
}

let seed = 3742
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3742 seeded random against path enumeration oracle', () => {
  for (let t = 0; t < 150; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    const grid = Array.from({ length: m }, (_, i) => Array.from({ length: n }, (_, j) => (i === 0 && j === 0 ? 0 : rnd(3))))
    const k = rnd(7)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})
