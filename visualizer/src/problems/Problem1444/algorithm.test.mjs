import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases, code, python } from './algorithm.js'

const MOD = 1000000007
const solve = (pizza, k) => buildTrace(parseInput(JSON.stringify({ pizza, k }))).result

// Independent oracle: plain recursion on rectangles with no table, so it shares no code with the trace.
function oracle(grid, k) {
  const R = grid.length, C = grid[0].length
  const apples = (r1, c1, r2, c2) => {
    let n = 0
    for (let r = r1; r < r2; r++) for (let c = c1; c < c2; c++) if (grid[r][c] === 'A') n++
    return n
  }
  const f = (r, c, pieces) => {
    if (pieces === 1) return apples(r, c, R, C) > 0 ? 1 : 0
    let total = 0
    for (let r2 = r + 1; r2 < R; r2++) if (apples(r, c, r2, C) > 0) total += f(r2, c, pieces - 1)
    for (let c2 = c + 1; c2 < C; c2++) if (apples(r, c, R, c2) > 0) total += f(r, c2, pieces - 1)
    return total
  }
  return f(0, 0, k) % MOD
}

test('a 3 by 3 pizza with two pieces has 4 ways', () => {
  assert.equal(solve(['..A', 'A..', '.A.'], 2), 4)
})

test('one piece is valid exactly when the pizza has an apple', () => {
  assert.equal(solve(['...', '.A.'], 1), 1)
  assert.equal(solve(['A..', '...'], 1), 1)
})

test('random small pizzas match the recursive oracle', () => {
  let state = 5
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 250; t++) {
    const R = 1 + rand(4), C = 1 + rand(4)
    const grid = Array.from({ length: R }, () => Array.from({ length: C }, () => (rand(3) === 0 ? 'A' : '.')).join(''))
    if (!grid.some(row => row.includes('A'))) continue
    const k = 1 + rand(4)
    assert.equal(solve(grid, k), oracle(grid, k), JSON.stringify({ grid, k }))
  }
})

test('frames map to real code and Python lines and end with the result', () => {
  const run = buildTrace(parseInput(JSON.stringify({ pizza: ['..A', 'A..', '.A.'], k: 2 })))
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.split('\n').length, frame.message)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= python.split('\n').length, frame.message)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('invalid pizzas are rejected', () => {
  assert.throws(() => parseInput('{"pizza":["A.","A"],"k":1}'), /same length/)
  assert.throws(() => parseInput('{"pizza":["..."],"k":1}'), /at least one apple/)
  assert.throws(() => parseInput('{"pizza":["AX"],"k":1}'), /only A/)
  assert.throws(() => parseInput('{"pizza":["A"],"k":11}'), /k must/)
})
