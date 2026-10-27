import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3212 examples', () => {
  assert.equal(solve(['XY.', 'Y..']), 3)
  assert.equal(solve(['XX', 'XY']), 0)
  assert.equal(solve(['..', '..']), 0)
})

test('3212 equal counts without any X do not qualify', () => {
  // The corner (0, 0) has zero X and zero Y, so it does not count; the whole grid has one X and one Y.
  assert.equal(solve(['.Y', 'X.']), 1)
})

test('3212 rejects other characters and ragged rows', () => {
  assert.throws(() => parseInput('{"grid":["XZ"]}'))
  assert.throws(() => parseInput('{"grid":["XY","X"]}'))
})

// Independent oracle: count the X and Y cells of every rectangle that starts at (0, 0), cell by cell.
function oracle(grid) {
  let count = 0
  for (let r = 0; r < grid.length; r++) for (let c = 0; c < grid[0].length; c++) {
    let x = 0, y = 0
    for (let i = 0; i <= r; i++) for (let j = 0; j <= c; j++) { if (grid[i][j] === 'X') x++; if (grid[i][j] === 'Y') y++ }
    if (x === y && x > 0) count++
  }
  return count
}

test('3212 random grids match a direct count oracle', () => {
  let seed = 3212
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = ['X', 'Y', '.']
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(6), cols = 1 + rnd(6)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => alphabet[rnd(3)]).join(''))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
