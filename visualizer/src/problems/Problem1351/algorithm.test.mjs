import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

// Reference: look at every cell directly.
const brute = grid => grid.flat().filter(v => v < 0).length

test('sample grid has four negative cells and the all-positive grid has none', () => {
  assert.equal(buildTrace(parseInput('[[4,3,-1],[3,1,-2],[2,-1,-3]]')).result, 4)
  assert.equal(buildTrace(parseInput('[[5,2],[3,1]]')).result, 0)
  assert.equal(buildTrace(parseInput('[[-1,-2],[-3,-4]]')).result, 4)
})

test('random sorted grids agree with the brute count', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let k = 0; k < 300; k++) {
    const m = 1 + rand(6), n = 1 + rand(6)
    const grid = Array.from({ length: m }, () => Array(n).fill(0))
    // Build from the top-left: each cell is at most its left and upper neighbours.
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) {
      const cap = Math.min(r > 0 ? grid[r - 1][c] : 100, c > 0 ? grid[r][c - 1] : 100)
      grid[r][c] = cap - rand(4)
    }
    assert.equal(buildTrace(grid).result, brute(grid), JSON.stringify(grid))
  }
})

test('parse rejects ragged rows and rows or columns that increase', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'), /same length/)
  assert.throws(() => parseInput('[[1,2]]'.replace('1,2', '1,3')), /left to right/)
  assert.throws(() => parseInput('[[1],[2]]'), /top to bottom/)
})

test('every frame names a real phase, a code line and a Python line', () => {
  const ids = new Set(phases.map(p => p.id))
  const pyLines = python.split('\n').length
  const run = buildTrace(parseInput('[[4,3,-1],[3,1,-2],[2,-1,-3]]'))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.ok(frame.message.length > 10)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
