import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('686 official examples', () => {
  assert.equal(buildTrace({ a: 'abcd', b: 'cdabcdab' }).result, 3)
  assert.equal(buildTrace({ a: 'a', b: 'aa' }).result, 2)
  assert.equal(buildTrace({ a: 'a', b: 'a'.repeat(20) + 'b' }).result, -1)
})

test('686 random strings match trying every repetition count up to a bound', () => {
  let state = 13
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  const word = len => Array.from({ length: len }, () => 'ab'[rand(2)]).join('')
  for (let t = 0; t < 400; t++) {
    const a = word(1 + rand(4)), b = word(1 + rand(7))
    let expected = -1
    for (let k = 1; k <= b.length + 2 && expected < 0; k++) if (a.repeat(k).includes(b)) expected = k
    assert.equal(buildTrace({ a, b }).result, expected, JSON.stringify({ a, b }))
  }
})

test('686 rejects empty strings', () => {
  assert.throws(() => parseInput('{"a":"","b":"x"}'))
})
