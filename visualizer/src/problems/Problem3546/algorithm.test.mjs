import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3546 official examples', () => {
  assert.equal(solve([[1, 4], [2, 3]]), true)
  assert.equal(solve([[1, 3], [2, 4]]), false)
})

test('3546 a single row can be split vertically', () => {
  assert.equal(solve([[3, 3]]), true)
})

test('3546 rejects a grid with ragged rows', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: try every cut position and sum each side from scratch.
function oracle(grid) {
  const m = grid.length
  const n = grid[0].length
  const total = grid.flat().reduce((a, b) => a + b, 0)
  for (let r = 1; r < m; r++) {
    let top = 0
    for (let i = 0; i < r; i++) for (let j = 0; j < n; j++) top += grid[i][j]
    if (top * 2 === total) return true
  }
  for (let c = 1; c < n; c++) {
    let leftSum = 0
    for (let i = 0; i < m; i++) for (let j = 0; j < c; j++) leftSum += grid[i][j]
    if (leftSum * 2 === total) return true
  }
  return false
}

test('3546 seeded random grids match a cut-by-cut oracle', () => {
  let seed = 3546
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = m === 1 ? 2 + rnd(5) : 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(6)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
