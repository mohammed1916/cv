import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('2711 official examples', () => {
  assert.deepEqual(solve([[1, 2, 3], [3, 1, 5], [3, 2, 1]]), [[1, 1, 0], [1, 0, 1], [0, 1, 1]])
  assert.deepEqual(solve([[1]]), [[0]])
})

test('2711 a diagonal with repeated values counts each value once', () => {
  assert.deepEqual(solve([[7, 7, 7]]), [[0, 0, 0]])
})

test('2711 rejects values outside 1 to 50', () => {
  assert.throws(() => parseInput('{"grid":[[0]]}'))
})

// Independent oracle: for each cell, rebuild the two diagonals as full arrays and take set sizes.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const out = []
  for (let i = 0; i < rows; i++) {
    const line = []
    for (let j = 0; j < cols; j++) {
      const diagonal = []
      for (let r = 0; r < rows; r++) {
        const c = r - i + j
        if (c >= 0 && c < cols) diagonal.push({ r, c, v: grid[r][c] })
      }
      const before = new Set(diagonal.filter(x => x.r < i).map(x => x.v)).size
      const after = new Set(diagonal.filter(x => x.r > i).map(x => x.v)).size
      line.push(Math.abs(before - after))
    }
    out.push(line)
  }
  return out
}

test('2711 seeded random grids match the diagonal-array oracle', () => {
  let seed = 2711
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const m = 1 + rnd(6)
    const n = 1 + rnd(6)
    const grid = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rnd(4)))
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
