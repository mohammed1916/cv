import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('2906 worked examples', () => {
  assert.deepEqual(solve([[1, 2], [3, 4]]), [[24, 12], [8, 6]])
  assert.deepEqual(solve([[12345], [2], [1]]), [[2], [0], [0]])
})

test('2906 single cell and a multiple of the modulus', () => {
  assert.deepEqual(solve([[7]]), [[1]])
  assert.deepEqual(solve([[5, 3]]), [[3, 5]])
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
})

// Independent oracle: multiply every other cell directly for each position.
function oracle(grid) {
  const flat = grid.flat()
  return grid.map((row, i) => row.map((_, j) => {
    let p = 1
    flat.forEach((v, k) => { if (k !== i * row.length + j) p = p * (v % 12345) % 12345 })
    return p
  }))
}

test('2906 random grids match a direct oracle', () => {
  let seed = 2906
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(3)
    const m = 1 + rnd(4)
    const grid = Array.from({ length: n }, () => Array.from({ length: m }, () => 1 + rnd(1e9)))
    assert.deepEqual(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
