import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (m, n) => buildTrace(parseInput(JSON.stringify({ m, n }))).result

test('1931 official examples', () => {
  assert.equal(solve(1, 1), 3)
  assert.equal(solve(1, 2), 6)
  assert.equal(solve(3, 3), 246)
})

test('1931 a single row of width one and a two-cell column', () => {
  assert.equal(solve(2, 1), 6)
  assert.equal(solve(3, 1), 12)
})

test('1931 rejects bad input', () => {
  assert.throws(() => parseInput('{"m":4,"n":1}'))
  assert.throws(() => parseInput('{"m":1,"n":7}'))
})

// Independent oracle: colour every cell of the grid directly, checking each cell against its
// upper and left neighbours.
function oracle(m, n) {
  const cells = m * n
  let count = 0
  const grid = Array(cells).fill(0)
  const total = 3 ** cells
  for (let code = 0; code < total; code++) {
    let c = code
    for (let i = 0; i < cells; i++) { grid[i] = c % 3; c = Math.floor(c / 3) }
    let ok = true
    for (let r = 0; r < m && ok; r++) {
      for (let col = 0; col < n && ok; col++) {
        const here = grid[col * m + r]
        if (r > 0 && grid[col * m + r - 1] === here) ok = false
        if (col > 0 && grid[(col - 1) * m + r] === here) ok = false
      }
    }
    if (ok) count++
  }
  return count % 1000000007
}

test('1931 small grids match the cell-by-cell oracle', () => {
  for (let m = 1; m <= 3; m++) {
    for (let n = 1; n <= 3; n++) assert.equal(solve(m, n), oracle(m, n), `m=${m} n=${n}`)
  }
})
