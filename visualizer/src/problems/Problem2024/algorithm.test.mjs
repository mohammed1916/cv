import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

// Independent oracle: try every window and count the letters that differ from the window's target.
function oracle(key, k) {
  let best = 0
  for (let l = 0; l < key.length; l++) for (let r = l; r < key.length; r++) {
    for (const letter of ['T', 'F']) {
      let diff = 0
      for (let i = l; i <= r; i++) if (key[i] !== letter) diff++
      if (diff <= k) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

test('examples', () => {
  assert.equal(solve('{"answerKey":"TTFF","k":2}'), 4)
  assert.equal(solve('{"answerKey":"TFFT","k":1}'), 3)
  assert.equal(solve('{"answerKey":"TTFTTFTT","k":1}'), 5)
})

test('every frame maps to code and python', () => {
  for (const frame of buildTrace(parseInput('{"answerKey":"TF","k":0}')).frames) {
    assert.ok(frame.activeLine > 0 && frame.pythonLine > 0)
  }
  assert.ok(code.length > 0 && python.includes('def '))
})

test('random keys match the window oracle', () => {
  let state = 367
  const rand = m => { state = (Math.imul(state, 1103515245) + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const key = Array.from({ length: 1 + rand(12) }, () => 'TF'[rand(2)]).join('')
    const k = rand(key.length + 1)
    assert.equal(solve(JSON.stringify({ answerKey: key, k })), oracle(key, k), JSON.stringify({ key, k }))
  }
})
