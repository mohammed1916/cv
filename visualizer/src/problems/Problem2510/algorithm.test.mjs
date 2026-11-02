import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(grid).result

test('2510 worked examples', () => {
  assert.equal(solve([[0, 1, 0, 0], [0, 1, 0, 0], [1, 0, 1, 0]]), true)
  assert.equal(solve([[1, 1, 0], [0, 0, 0]]), true)
  assert.equal(solve([[0, 0, 0], [0, 0, 0]]), false)
  assert.equal(solve([[0]]), false)
  assert.equal(solve([[0, 1]]), true)
})

test('2510 rejects non-binary cells', () => {
  assert.throws(() => parseInput('[[0,2]]'))
  assert.throws(() => parseInput('[[0],[1,0]]'))
})

// Oracle: enumerate every right-or-down path explicitly and count zeros and ones on it.
function oracle(grid) {
  const m = grid.length, n = grid[0].length
  const walk = (r, c, zeros, ones) => {
    zeros += grid[r][c] === 0 ? 1 : 0
    ones += grid[r][c] === 1 ? 1 : 0
    if (r === m - 1 && c === n - 1) return zeros === ones
    if (r + 1 < m && walk(r + 1, c, zeros, ones)) return true
    if (c + 1 < n && walk(r, c + 1, zeros, ones)) return true
    return false
  }
  return walk(0, 0, 0, 0)
}

test('2510 random grids match an explicit path oracle', () => {
  let seed = 2510
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(5), n = 1 + rnd(5)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => rnd(2)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
