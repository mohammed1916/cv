import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every column where the first robot switches rows.
function oracle(grid) {
  const n = grid[0].length
  let best = Infinity
  for (let s = 0; s < n; s++) {
    const top = grid[0].slice(s + 1).reduce((a, b) => a + b, 0)
    const bottom = grid[1].slice(0, s).reduce((a, b) => a + b, 0)
    best = Math.min(best, Math.max(top, bottom))
  }
  return best
}

test('examples', () => {
  assert.equal(solve('[[2,5,4],[1,5,1]]'), 4)
  assert.equal(solve('[[3,3,1],[8,5,2]]'), 4)
  assert.equal(solve('[[1,3,1,15],[1,3,3,1]]'), 7)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[1,2],[3,4]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random grids match the column oracle', () => {
  let state = 281
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const n = 2 + rand(8)
    const grid = [0, 1].map(() => Array.from({ length: n }, () => rand(20)))
    assert.equal(solve(JSON.stringify(grid)), oracle(grid), JSON.stringify(grid))
  }
})
