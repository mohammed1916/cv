import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('730 official examples', () => {
  assert.equal(buildTrace('bccb').result, 6)
})

// Oracle: enumerate every non-empty subsequence and collect the distinct palindromic strings.
test('730 short strings match subsequence enumeration', () => {
  let state = 271
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rand(8) }, () => 'abcd'[rand(4)]).join('')
    const found = new Set()
    for (let mask = 1; mask < 1 << s.length; mask++) {
      const sub = [...s].filter((_, i) => mask & (1 << i)).join('')
      if (sub === [...sub].reverse().join('')) found.add(sub)
    }
    assert.equal(buildTrace(s).result, found.size, s)
  }
})

test('730 rejects strings longer than the visualization limit', () => {
  assert.throws(() => parseInput('"abcdabcdabcda"'))
})
