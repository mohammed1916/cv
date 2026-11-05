import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: enumerate every choice (small matrices only).
function oracle({ mat, target }) {
  let best = Infinity
  const walk = (r, total) => {
    if (r === mat.length) { best = Math.min(best, Math.abs(total - target)); return }
    for (const v of mat[r]) walk(r + 1, total + v)
  }
  walk(0, 0)
  return best
}

test('examples', () => {
  assert.equal(solve('{"mat":[[1,2,3],[4,5,6],[7,8,9]],"target":13}'), 0)
  assert.equal(solve('{"mat":[[1],[2],[3]],"target":100}'), 94)
  assert.equal(solve('{"mat":[[1,2,9,8,7]],"target":6}'), 1)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"mat":[[1,2],[3,4]],"target":5}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random matrices match the enumeration oracle', () => {
  let state = 11
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 150; t++) {
    const m = 1 + rand(4), n = 1 + rand(4)
    const mat = Array.from({ length: m }, () => Array.from({ length: n }, () => 1 + rand(9)))
    const input = { mat, target: 1 + rand(40) }
    assert.equal(solve(JSON.stringify(input)), oracle(input))
  }
})
