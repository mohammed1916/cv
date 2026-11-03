import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (grid, limit) => buildTrace({ grid, limit }).result

function checkFrames(run) {
  const lines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, 'activeLine in range')
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= lines, 'pythonLine in range')
    assert.equal(typeof f.message, 'string')
  }
}

// Brute force over all column subsets (small grids only).
function brute(grid, limit) {
  const rows = grid.length, cols = grid[0].length
  let best = 0
  for (let mask = 1; mask < 1 << cols; mask++) {
    const pick = []
    for (let c = 0; c < cols; c++) if (mask & (1 << c)) pick.push(c)
    const ok = pick.every((c, idx) => idx === 0 || grid.every(row => Math.abs(row[pick[idx - 1]] - row[c]) <= limit))
    if (ok) best = Math.max(best, pick.length)
  }
  return best
}

test('3989 authored examples', () => {
  assert.equal(solve([[1, 5, 9, 2], [2, 4, 8, 3]], 2), 2)
  assert.equal(solve([[3, 3, 3], [0, 1, 2]], 3), 3)
})

test('3989 a single column is always kept', () => {
  assert.equal(solve([[7], [-20]], 0), 1)
})

test('3989 rejects ragged or out-of-range grids', () => {
  assert.throws(() => parseInput('{"grid":[[1,2],[3]],"limit":1}'))
  assert.throws(() => parseInput('{"grid":[[21]],"limit":1}'))
  assert.throws(() => parseInput('{"grid":[[1]],"limit":-1}'))
})

test('3989 random grids match a subset brute force', () => {
  let seed = 3989
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(3), cols = 1 + rnd(6)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(21) - 10))
    const limit = rnd(12)
    const run = buildTrace({ grid, limit })
    assert.equal(run.result, brute(grid, limit), JSON.stringify({ grid, limit }))
    checkFrames(run)
  }
})
