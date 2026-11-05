import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every common target value near the data and take the cheapest.
function oracle(grid, x) {
  const values = grid.flat()
  if (values.some(v => (v - values[0]) % x !== 0)) return -1
  let best = Infinity
  const lo = Math.min(...values), hi = Math.max(...values)
  for (let t = lo; t <= hi; t++) {
    if ((t - values[0]) % x !== 0) continue
    let cost = 0
    for (const v of values) cost += Math.abs(v - t) / x
    best = Math.min(best, cost)
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"grid":[[2,4],[6,8]],"x":2}'), 4)
  assert.equal(solve('{"grid":[[1,5],[2,3]],"x":1}'), 5)
  assert.equal(solve('{"grid":[[1,2],[3,4]],"x":2}'), -1)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"grid":[[2,4]],"x":2}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random grids match the target-scan oracle', () => {
  let state = 461
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const x = 1 + rand(4)
    const base = 1 + rand(10)
    const rows = 1 + rand(3), cols = 1 + rand(3)
    const grid = Array.from({ length: rows }, () => Array.from({ length: cols }, () => base + x * rand(6)))
    assert.equal(solve(JSON.stringify({ grid, x })), oracle(grid, x), JSON.stringify({ grid, x }))
  }
})
