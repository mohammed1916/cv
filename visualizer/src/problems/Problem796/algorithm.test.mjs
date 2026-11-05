import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('796 rotations are recognised and near misses are not', () => {
  assert.equal(buildTrace({ s: 'abcde', goal: 'cdeab' }).result, true)
  assert.equal(buildTrace({ s: 'abcde', goal: 'abced' }).result, false)
  assert.equal(buildTrace({ s: 'a', goal: 'aa' }).result, false)
})

test('796 random pairs match the doubled-string test', () => {
  let state = 796
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = n => Array.from({ length: n }, () => 'ab'[rand(2)]).join('')
  for (let t = 0; t < 800; t++) {
    const s = word(rand(7)), goal = word(rand(7))
    const expected = s.length === goal.length && (s + s).includes(goal)
    assert.equal(buildTrace({ s, goal }).result, expected, JSON.stringify({ s, goal }))
  }
})

test('796 rejects non-letter input', () => {
  assert.throws(() => parseInput('{"s":"A","goal":"a"}'))
})
