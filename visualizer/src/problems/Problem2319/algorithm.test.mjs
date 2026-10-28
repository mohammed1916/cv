import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2319 official examples', () => {
  assert.equal(solve({ grid: [[2, 0, 0, 1], [0, 3, 1, 0], [0, 5, 2, 0], [4, 0, 0, 2]] }), true)
  assert.equal(solve({ grid: [[5, 7, 0], [0, 3, 1], [0, 5, 0]] }), false)
})

test('2319 a zero on a diagonal breaks the rule', () => {
  assert.equal(solve({ grid: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] }), false)
})

test('2319 rejects a non-square grid', () => {
  assert.throws(() => parseInput('{"grid":[[1,0,1],[0,1,0]]}'))
})

// Independent oracle: compare the set of nonzero positions with the set of diagonal positions.
function oracle({ grid }) {
  const n = grid.length
  const nonzero = []
  const diagonal = []
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    if (grid[i][j] !== 0) nonzero.push(`${i},${j}`)
    if (i === j || i + j === n - 1) diagonal.push(`${i},${j}`)
  }
  return nonzero.sort().join(';') === [...new Set(diagonal)].sort().join(';')
}

test('2319 random grids match a position-set oracle', () => {
  let seed = 2319
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(4)
    // Build X-shaped grids half the time so the true branch is exercised often.
    const xShaped = rnd(2) === 0
    const grid = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => {
      const diagonal = i === j || i + j === n - 1
      if (xShaped) return diagonal ? 1 + rnd(9) : 0
      return rnd(3) === 0 ? 0 : 1 + rnd(9)
    }))
    const input = { grid }
    assert.equal(solve(input), oracle(input), JSON.stringify(grid))
  }
})
