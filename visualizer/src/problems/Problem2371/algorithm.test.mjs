import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).best

test('2371 worked examples', () => {
  assert.equal(solve([[3, 1], [2, 4]]), 2)
  assert.equal(solve([[7, 3, 9]]), 3)
  assert.equal(solve([[10]]), 1)
})

test('2371 each row and column keeps its strict order', () => {
  const grid = [[4, 2, 9], [1, 8, 3]]
  const { result } = buildTrace(grid)
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) {
    for (let d = 0; d < 3; d++) if (grid[r][d] > grid[r][c]) assert.ok(result[r][d] > result[r][c])
    for (let k = 0; k < 2; k++) if (grid[k][c] > grid[r][c]) assert.ok(result[k][c] > result[r][c])
  }
})

test('2371 rejects repeated values and oversized grids', () => {
  assert.throws(() => parseInput('[[1,1]]'))
  assert.throws(() => parseInput('[[1,2,3,4,5,6,7]]'))
})

// Oracle: the longest strictly increasing chain of cells ending at each cell, by memoised search.
function oracle(grid) {
  const m = grid.length, n = grid[0].length
  const memo = new Map()
  const height = (r, c) => {
    const key = r * n + c
    if (memo.has(key)) return memo.get(key)
    let best = 0
    for (let k = 0; k < m; k++) if (grid[k][c] < grid[r][c]) best = Math.max(best, height(k, c))
    for (let d = 0; d < n; d++) if (grid[r][d] < grid[r][c]) best = Math.max(best, height(r, d))
    memo.set(key, best + 1)
    return best + 1
  }
  let answer = 0
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) answer = Math.max(answer, height(r, c))
  return answer
}

test('2371 random grids match a longest-chain oracle', () => {
  let seed = 2371
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(4), n = 1 + rnd(4)
    const pool = Array.from({ length: 30 }, (_, i) => i + 1)
    for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]] }
    const grid = Array.from({ length: m }, (_, r) => pool.slice(r * n, r * n + n))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
