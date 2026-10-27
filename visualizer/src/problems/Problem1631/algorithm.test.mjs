import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = heights => buildTrace(parseInput(JSON.stringify({ heights }))).result

test('1631 examples', () => {
  assert.equal(solve([[1, 2, 2], [3, 8, 2], [5, 3, 5]]), 2)
  assert.equal(solve([[1, 2, 3], [3, 8, 4], [5, 3, 5]]), 1)
  assert.equal(solve([[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]), 0)
})

test('1631 a single cell has no effort', () => {
  assert.equal(solve([[5]]), 0)
})

test('1631 rejects a height of zero', () => {
  assert.throws(() => parseInput('{"heights":[[0,1]]}'))
})

// Independent oracle: binary search over the allowed effort, checking reachability with a flood fill.
function oracle(heights) {
  const rows = heights.length, cols = heights[0].length
  const diffs = new Set([0])
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r + 1 < rows) diffs.add(Math.abs(heights[r][c] - heights[r + 1][c]))
    if (c + 1 < cols) diffs.add(Math.abs(heights[r][c] - heights[r][c + 1]))
  }
  const levels = [...diffs].sort((a, b) => a - b)
  const reachable = limit => {
    const seen = Array.from({ length: rows }, () => new Array(cols).fill(false))
    const stack = [[0, 0]]
    seen[0][0] = true
    while (stack.length) {
      const [r, c] = stack.pop()
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nc >= 0 && nr < rows && nc < cols && !seen[nr][nc] && Math.abs(heights[nr][nc] - heights[r][c]) <= limit) { seen[nr][nc] = true; stack.push([nr, nc]) }
      }
    }
    return seen[rows - 1][cols - 1]
  }
  let lo = 0, hi = levels.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (reachable(levels[mid])) hi = mid
    else lo = mid + 1
  }
  return levels[lo]
}

test('1631 random grids match a threshold-search oracle', () => {
  let seed = 1631
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(5), cols = 1 + rnd(5)
    const heights = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(9)))
    assert.equal(solve(heights), oracle(heights), JSON.stringify(heights))
  }
})
