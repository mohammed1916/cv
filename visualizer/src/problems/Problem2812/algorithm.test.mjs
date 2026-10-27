import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2812 examples', () => {
  assert.equal(solve([[1, 0, 0], [0, 0, 0], [0, 0, 1]]), 0)
  assert.equal(solve([[0, 0, 1], [0, 0, 0], [0, 0, 0]]), 2)
  assert.equal(solve([[0, 0, 0, 1], [0, 0, 0, 0], [0, 0, 0, 0], [1, 0, 0, 0]]), 2)
})

test('2812 a single thief in the middle of a 3 by 3 grid', () => {
  // The centre is at distance 0; the corners are at distance 2, and a route can avoid the centre at distance 1.
  assert.equal(solve([[0, 0, 0], [0, 1, 0], [0, 0, 0]]), 1)
})

test('2812 rejects a grid without thieves and a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[0,0],[0,0]]}'))
  assert.throws(() => parseInput('{"grid":[[1,0,0],[0,0,0]]}'))
})

// Independent oracle: each cell's distance is computed directly as the minimum Manhattan distance to a thief.
// The answer is the largest threshold t for which a flood fill over cells with distance at least t connects the corners.
function oracle(grid) {
  const n = grid.length
  const thieves = []
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 1) thieves.push([r, c]) }))
  const d = grid.map((row, r) => row.map((_, c) => Math.min(...thieves.map(([tr, tc]) => Math.abs(tr - r) + Math.abs(tc - c)))))
  const maxD = Math.max(...d.flat())
  for (let t = maxD; t >= 0; t--) {
    if (d[0][0] < t) continue
    const seen = Array.from({ length: n }, () => new Array(n).fill(false))
    const stack = [[0, 0]]
    seen[0][0] = true
    while (stack.length) {
      const [r, c] = stack.pop()
      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nr = r + dr, nc = c + dc
        if (nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc] && d[nr][nc] >= t) { seen[nr][nc] = true; stack.push([nr, nc]) }
      }
    }
    if (seen[n - 1][n - 1]) return t
  }
  return -1
}

test('2812 random grids match a threshold flood-fill oracle', () => {
  let seed = 2812
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rnd(5)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => (rnd(4) === 0 ? 1 : 0)))
    if (!grid.some(row => row.includes(1))) grid[rnd(n)][rnd(n)] = 1
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
