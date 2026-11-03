import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = heights => buildTrace(heights).result

// Brute force straight from the rule: a target is visible when every person between is strictly
// shorter than both endpoints.
function oracle(heights) {
  const rows = heights.length
  const cols = heights[0].length
  const out = Array.from({ length: rows }, () => Array(cols).fill(0))
  const visibleSteps = (line, from, dir) => {
    let count = 0
    for (let k = from + dir; k >= 0 && k < line.length; k += dir) {
      const cap = Math.min(line[from], line[k])
      let blockedInside = false
      for (let between = from + dir; between !== k; between += dir) {
        if (line[between] >= cap) { blockedInside = true; break }
      }
      if (!blockedInside) count += 1
    }
    return count
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    // right: scan from (r,c) to the end of row r
    const row = heights[r]
    const right = row.slice(c)
    out[r][c] += visibleSteps(right, 0, 1)
    const col = heights.map(line => line[c]).slice(r)
    out[r][c] += visibleSteps(col, 0, 1)
  }
  return out
}

test('2282 hand-checked single row and column', () => {
  assert.deepEqual(solve([[5, 3, 4]]), [[2, 1, 0]])
  assert.deepEqual(solve([[5], [3], [4]]), [[2], [1], [0]])
})

test('2282 equal heights hide people behind them', () => {
  assert.deepEqual(solve([[2, 2, 2]]), [[1, 1, 0]])
  assert.deepEqual(solve([[5, 2, 2, 4]]), [[2, 1, 1, 0]])
})

test('2282 single cell sees nobody', () => {
  assert.deepEqual(solve([[7]]), [[0]])
})

test('2282 random grids match the brute-force rule', () => {
  let seed = 2282
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const rows = 1 + rnd(5)
    const cols = 1 + rnd(5)
    const heights = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 1 + rnd(5)))
    assert.deepEqual(solve(heights), oracle(heights), JSON.stringify(heights))
  }
})

test('2282 parse rejects ragged grids and out-of-range heights', () => {
  assert.throws(() => parseInput('[[1,2],[3]]'))
  assert.throws(() => parseInput('[[0,2]]'))
  assert.throws(() => parseInput('[[1.5]]'))
  assert.throws(() => parseInput('[]'))
})

test('2282 frame invariants', () => {
  const run = buildTrace([[3, 1, 4], [1, 5, 9]])
  const pyLines = python.split('\n').length
  assert.equal(run.frames[0].phase, 'start')
  assert.equal(run.frames.at(-1).phase, 'done')
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length, `activeLine ${frame.activeLine}`)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines, `pythonLine ${frame.pythonLine}`)
    assert.equal(frame.answer.length, run.rows)
    assert.equal(typeof frame.message, 'string')
  }
  assert.deepEqual(run.frames.at(-1).answer, run.result)
})
