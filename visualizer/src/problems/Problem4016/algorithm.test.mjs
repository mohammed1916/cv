import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('4016 small hand cases', () => {
  assert.equal(solve([[1]]), 0)
  assert.equal(solve([[1, 1], [1, 1]]), 1)
  assert.equal(solve([[1, 1, 0, 0], [1, 1, 0, 0], [0, 0, 1, 1], [0, 0, 1, 1]]), 4)
  assert.equal(solve([[1, 1, 1], [1, 1, 1], [1, 1, 1]]), 1)
  assert.equal(solve([[1, 1, 1, 1], [1, 1, 1, 1]]), 4)
})

test('4016 rejects ragged or non-binary grids', () => {
  assert.throws(() => parseInput('{"grid":[[1,1],[1]]}'))
  assert.throws(() => parseInput('{"grid":[[1,2]]}'))
})

// Brute oracle: list every all-one square of every side and test every pair of cells for overlap.
function brute(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const squares = []
  for (let s = 1; s <= Math.min(rows, cols); s++) {
    for (let r = 0; r + s <= rows; r++) {
      for (let c = 0; c + s <= cols; c++) {
        const cells = []
        let ok = true
        for (let i = 0; i < s; i++) for (let j = 0; j < s; j++) {
          if (grid[r + i][c + j] !== 1) ok = false
          cells.push(`${r + i},${c + j}`)
        }
        if (ok) squares.push({ s, cells })
      }
    }
  }
  let best = 0
  for (let x = 0; x < squares.length; x++) {
    for (let y = x + 1; y < squares.length; y++) {
      if (squares[x].s !== squares[y].s) continue
      if (squares[x].cells.some(cell => squares[y].cells.includes(cell))) continue
      best = Math.max(best, squares[x].s * squares[x].s)
    }
  }
  return best
}

test('4016 matches an all-pairs oracle on random grids', () => {
  let seed = 4016
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rnd(10) < 7 ? 1 : 0)))
    assert.equal(solve(grid), brute(grid), JSON.stringify(grid))
  }
})

test('4016 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ grid: [[1, 1, 0], [1, 1, 0], [0, 0, 1]] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
