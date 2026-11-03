import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: count right-and-down paths with memoized recursion from the bottom-right corner.
function countPaths(grid) {
  const m = grid.length, n = grid[0].length
  const memo = new Map()
  const go = (r, c) => {
    if (r < 0 || c < 0 || grid[r][c] !== '.') return 0
    if (r === 0 && c === 0) return 1
    const key = `${r},${c}`
    if (memo.has(key)) return memo.get(key)
    const value = go(r - 1, c) + go(r, c - 1)
    memo.set(key, value)
    return value
  }
  return go(m - 1, n - 1)
}

test('3963 presets produce a single-path grid', () => {
  for (const input of ['{"rows":3,"cols":4}', '{"rows":1,"cols":5}']) {
    const { result } = buildTrace(parseInput(input))
    assert.equal(countPaths(result), 1, input)
  }
})

test('3963 the grid has the requested shape and free endpoints', () => {
  const grid = buildTrace({ rows: 3, cols: 4 }).result
  assert.deepEqual(grid, ['....', '###.', '###.'])
  assert.equal(grid.length, 3)
  assert.ok(grid.every(row => row.length === 4))
  assert.equal(grid[0][0], '.')
  assert.equal(grid[2][3], '.')
})

test('3963 every size from 1 to 25 gives exactly one path', () => {
  for (let m = 1; m <= 25; m++) for (let n = 1; n <= 25; n++) {
    const grid = buildTrace({ rows: m, cols: n }).result
    assert.equal(grid.length, m)
    assert.equal(countPaths(grid), 1, `${m}x${n}`)
  }
})

test('3963 rejects bad sizes', () => {
  assert.throws(() => parseInput('{"rows":0,"cols":2}'))
  assert.throws(() => parseInput('{"rows":2,"cols":26}'))
})
