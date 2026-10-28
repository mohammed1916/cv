import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('1267 official examples', () => {
  assert.equal(solve([[1, 0], [0, 1]]), 0)
  assert.equal(solve([[1, 0], [1, 1]]), 3)
  assert.equal(solve([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]), 0)
})

test('1267 a lone server in a row with a partner in its column still counts', () => {
  assert.equal(solve([[1, 0, 0], [1, 0, 0], [0, 0, 1]]), 2)
})

test('1267 rejects values other than 0 and 1', () => {
  assert.throws(() => parseInput('{"grid":[[2]]}'))
})

// Independent oracle: for each server, scan its whole row and column for another server.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] !== 1) continue
      let partner = false
      for (let k = 0; k < cols; k++) if (k !== c && grid[r][k] === 1) partner = true
      for (let k = 0; k < rows; k++) if (k !== r && grid[k][c] === 1) partner = true
      if (partner) count++
    }
  }
  return count
}

test('1267 seeded random grids match the pairwise oracle', () => {
  let seed = 1267
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => (rnd(3) === 0 ? 1 : 0)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
