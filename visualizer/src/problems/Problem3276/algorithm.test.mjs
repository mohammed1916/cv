import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify({ grid }))).result

test('3276 examples', () => {
  assert.equal(solve([[1, 2, 3], [4, 3, 2], [1, 1, 1]]), 8)
  assert.equal(solve([[8, 7, 6]]), 8)
})

test('3276 a repeated value is taken once', () => {
  assert.equal(solve([[5, 5], [5, 5]]), 5)
})

test('3276 rejects bad input', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]]}'))
  assert.throws(() => parseInput('{"grid":[[0]]}'))
})

// Independent oracle: try every subset of cells, keep those with distinct rows and distinct values, and take the best sum.
function oracle(grid) {
  const cells = []
  grid.forEach((row, r) => row.forEach(v => cells.push({ r, v })))
  let best = -Infinity
  for (let mask = 1; mask < 1 << cells.length; mask++) {
    const usedRows = new Set()
    const usedValues = new Set()
    let sum = 0
    let ok = true
    for (let i = 0; i < cells.length && ok; i++) {
      if (!(mask & (1 << i))) continue
      const { r, v } = cells[i]
      if (usedRows.has(r) || usedValues.has(v)) ok = false
      usedRows.add(r)
      usedValues.add(v)
      sum += v
    }
    if (ok) best = Math.max(best, sum)
  }
  return best
}

test('3276 random grids match subset enumeration', () => {
  let seed = 3276
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const rows = 1 + rnd(3)
    const cols = 1 + rnd(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(9)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
