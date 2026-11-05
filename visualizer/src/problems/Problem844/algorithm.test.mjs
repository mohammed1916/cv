import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

function typed(str) {
  const out = []
  for (const ch of str) { if (ch === '#') out.pop(); else out.push(ch) }
  return out.join('')
}

test('844 random strings match building the typed result', () => {
  let state = 844
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(7) }, () => 'ab#'[rand(3)]).join('')
  for (let t = 0; t < 1500; t++) {
    const s = word(), u = word()
    assert.equal(buildTrace({ s, t: u }).result, typed(s) === typed(u), JSON.stringify({ s, u }))
  }
})

test('844 worked case with equal results', () => {
  assert.equal(buildTrace({ s: 'ab#c', t: 'ad#c' }).result, true)
})

test('844 rejects other characters', () => {
  assert.throws(() => parseInput('{"s":"A","t":"a"}'))
})
