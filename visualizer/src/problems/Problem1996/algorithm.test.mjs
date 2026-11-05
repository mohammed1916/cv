import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: a character is weak if some other character is strictly greater in both.
function oracle(props) {
  return props.filter(([a, d]) => props.some(([x, y]) => x > a && y > d)).length
}

test('examples', () => {
  assert.equal(solve('[[5,5],[6,3],[3,6]]'), 0)
  assert.equal(solve('[[2,2],[3,3]]'), 1)
  assert.equal(solve('[[1,5],[10,4],[4,3]]'), 1)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('[[2,2],[3,3]]')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random characters match the pairwise oracle', () => {
  let state = 149
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const props = Array.from({ length: 2 + rand(10) }, () => [1 + rand(6), 1 + rand(6)])
    assert.equal(solve(JSON.stringify(props)), oracle(props), JSON.stringify(props))
  }
})
