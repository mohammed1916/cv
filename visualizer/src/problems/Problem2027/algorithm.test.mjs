import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: cover every X greedily by choosing windows of length three, leftmost X first.
function oracle(s) {
  const covered = Array(s.length).fill(false)
  let moves = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'X' && !covered[i]) {
      moves++
      for (let k = i; k < Math.min(s.length, i + 3); k++) covered[k] = true
    }
  }
  return moves
}

test('examples', () => {
  assert.equal(solve('{"s":"XXX"}'), 1)
  assert.equal(solve('{"s":"XXOX"}'), 2)
  assert.equal(solve('{"s":"OOOO"}'), 0)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"s":"XXOX"}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random strings match the cover oracle', () => {
  let state = 383
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rand(20) }, () => 'XO'[rand(2)]).join('')
    assert.equal(solve(JSON.stringify({ s })), oracle(s), s)
  }
})
