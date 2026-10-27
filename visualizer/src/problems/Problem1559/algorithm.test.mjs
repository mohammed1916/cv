import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('1559 official examples', () => {
  assert.equal(solve(['aaaa', 'abba', 'abba', 'aaaa']), true)
  assert.equal(solve(['abb', 'bzb', 'bba']), false)
})

test('1559 edge cases: a single cell and a 2 by 2 square', () => {
  assert.equal(solve(['a']), false)
  assert.equal(solve(['aa', 'aa']), true)
  assert.equal(solve(['ab', 'ba']), false)
})

test('1559 rejects ragged rows and characters outside a to z', () => {
  assert.throws(() => parseInput('{"grid":["ab","c"]}'))
  assert.throws(() => parseInput('{"grid":["A"]}'))
})

// Independent oracle: depth-first search for a cycle, skipping the cell we came from.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false))
  const dfs = (r, c, fromR, fromC) => {
    visited[r][c] = true
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
      const nr = r + dr
      const nc = c + dc
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] !== grid[r][c]) continue
      if (nr === fromR && nc === fromC) continue
      if (visited[nr][nc]) return true
      if (dfs(nr, nc, r, c)) return true
    }
    return false
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!visited[r][c] && dfs(r, c, -1, -1)) return true
    }
  }
  return false
}

test('1559 random grids match a depth-first cycle oracle', () => {
  let seed = 1559
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 'ab'[rnd(2)]).join(''))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
