import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = grid => buildTrace(parseInput(JSON.stringify(grid))).result

test('3128 official examples', () => {
  assert.equal(solve([[0, 1, 0], [0, 1, 1], [0, 1, 0]]), 2)
  assert.equal(solve([[1, 0, 0, 0], [0, 1, 0, 1], [1, 0, 0, 0]]), 0)
  assert.equal(solve([[1, 0, 1], [1, 0, 0], [1, 0, 0]]), 2)
})

test('3128 edge cases: a single 1 and an all-zero grid', () => {
  assert.equal(solve([[1]]), 0)
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('3128 rejects ragged rows and values other than 0 or 1', () => {
  assert.throws(() => parseInput('[[1,0],[1]]'))
  assert.throws(() => parseInput('[[2]]'))
})

// Independent oracle: examine every set of three 1s and check whether one of them has a partner
// in its row and the third in its column.
function oracle(grid) {
  const ones = []
  grid.forEach((row, r) => row.forEach((v, c) => { if (v === 1) ones.push([r, c]) }))
  let count = 0
  for (let a = 0; a < ones.length; a++) {
    for (let b = a + 1; b < ones.length; b++) {
      for (let c = b + 1; c < ones.length; c++) {
        const trio = [ones[a], ones[b], ones[c]]
        const isCorner = (v, p, q) => (p[0] === v[0] && q[1] === v[1]) || (q[0] === v[0] && p[1] === v[1])
        const [x, y, z] = trio
        if (isCorner(x, y, z) || isCorner(y, x, z) || isCorner(z, x, y)) count += 1
      }
    }
  }
  return count
}

test('3128 random grids match a triple-enumeration oracle', () => {
  let seed = 3128
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(3) === 0 ? 1 : 0)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})
