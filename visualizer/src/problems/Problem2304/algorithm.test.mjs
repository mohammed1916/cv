import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2304 a single cell costs its own value', () => {
  // The grid must hold 0 to m*n-1, so one cell holds 0 and no move is paid.
  assert.equal(solve({ grid: [[0]], move_cost: [[7]] }), 0)
})

test('2304 two rows add the move cost from the value above', () => {
  // Start at 0 (cost 0), move from value 0 into column 0 (cost 1), then take value 2: total 3.
  const input = { grid: [[0, 1], [2, 3]], move_cost: [[1, 1], [1, 1], [1, 1], [1, 1]] }
  assert.equal(solve(input), 3)
})

test('2304 rejects a grid that is not a permutation', () => {
  assert.throws(() => parseInput(JSON.stringify({ grid: [[0, 0]], move_cost: [[1, 1], [1, 1]] })))
})

// Independent oracle: enumerate every choice of one column per row and price each path directly.
function oracle({ grid, move_cost }) {
  const m = grid.length
  const n = grid[0].length
  let best = Infinity
  const walk = (r, c, cost) => {
    const total = cost + grid[r][c]
    if (r === m - 1) { best = Math.min(best, total); return }
    for (let next = 0; next < n; next++) walk(r + 1, next, total + move_cost[grid[r][c]][next])
  }
  for (let c = 0; c < n; c++) walk(0, c, 0)
  return best
}

test('2304 random grids match an enumeration of every path', () => {
  let seed = 2304
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4)
    const n = 1 + rnd(4)
    const pool = Array.from({ length: m * n }, (_, i) => i)
    const flat = []
    while (pool.length) flat.push(pool.splice(rnd(pool.length), 1)[0])
    const grid = Array.from({ length: m }, (_, r) => flat.slice(r * n, r * n + n))
    const move_cost = Array.from({ length: m * n }, () => Array.from({ length: n }, () => rnd(10)))
    const input = { grid, move_cost }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
