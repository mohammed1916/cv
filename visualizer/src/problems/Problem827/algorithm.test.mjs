import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function brute(grid) {
  // Try every single flip (or none) and measure the largest island by flood fill.
  const n = grid.length
  const largest = g => {
    const seen = Array.from({ length: n }, () => Array(n).fill(false))
    let best = 0
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
      if (g[r][c] !== 1 || seen[r][c]) continue
      let count = 0
      const stack = [[r, c]]; seen[r][c] = true
      while (stack.length) {
        const [y, x] = stack.pop(); count++
        for (const [dy, dx] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ny = y + dy, nx = x + dx
          if (ny >= 0 && nx >= 0 && ny < n && nx < n && g[ny][nx] === 1 && !seen[ny][nx]) { seen[ny][nx] = true; stack.push([ny, nx]) }
        }
      }
      best = Math.max(best, count)
    }
    return best
  }
  let best = largest(grid)
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (grid[r][c] === 0) { const g = grid.map(row => [...row]); g[r][c] = 1; best = Math.max(best, largest(g)) }
  }
  return best
}

test('827 worked examples', () => {
  assert.equal(buildTrace([[1, 0], [0, 1]]).result, 3)
  assert.equal(buildTrace([[1, 1], [1, 1]]).result, 4)
})

test('827 random grids match a try-every-flip search', () => {
  let state = 827
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(5)
    const grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rand(2)))
    assert.equal(buildTrace(grid).result, brute(grid), JSON.stringify(grid))
  }
})

test('827 rejects a non-square grid', () => {
  assert.throws(() => parseInput('[[1,0]]'))
})
