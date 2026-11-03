import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = grid => buildTrace({ grid }).result

test('2174 an empty grid needs no operation', () => {
  assert.equal(solve([[0, 0], [0, 0]]), 0)
})

test('2174 one cell takes one operation', () => {
  assert.equal(solve([[1]]), 1)
  assert.equal(solve([[0, 1], [0, 0]]), 1)
})

test('2174 a full row clears in one operation', () => {
  // Clearing (0,0) zeroes row 0 and column 0, which removes every one.
  assert.equal(solve([[1, 1, 1], [0, 0, 0]]), 1)
})

test('2174 a diagonal needs one operation per cell', () => {
  assert.equal(solve([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3)
})

test('2174 the parser rejects bad grids', () => {
  assert.throws(() => parseInput('{"grid":[]}'))
  assert.throws(() => parseInput('{"grid":[[1,2]]}'))
  assert.throws(() => parseInput('{"grid":[[1,0],[1]]}'))
  assert.throws(() => parseInput('{"grid":[[1,1,1,1,1]]}'))
})

// Independent oracle: plain recursion on copies of the grid, trying every clearing sequence.
function oracle(grid) {
  const rows = grid.length
  const cols = grid[0].length
  const best = g => {
    let anyOne = false
    for (const row of g) if (row.some(v => v === 1)) anyOne = true
    if (!anyOne) return 0
    let answer = Infinity
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r][c] !== 1) continue
        const next = g.map(row => row.slice())
        for (let k = 0; k < cols; k++) next[r][k] = 0
        for (let k = 0; k < rows; k++) next[k][c] = 0
        answer = Math.min(answer, 1 + best(next))
      }
    }
    return answer
  }
  return best(grid)
}

test('2174 random small grids match the recursive oracle', () => {
  let seed = 2174
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 200; t++) {
    const rows = 1 + rnd(3)
    const cols = 1 + rnd(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => rnd(2)))
    assert.equal(solve(grid), oracle(grid), JSON.stringify(grid))
  }
})

test('2174 frame invariants hold', () => {
  const run = buildTrace({ grid: [[1, 1, 0], [0, 1, 1], [1, 0, 1]] })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.ok(f.ones.every(([r, c]) => (f.rowMask >> r & 1) === 0 && (f.colMask >> c & 1) === 0))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})
