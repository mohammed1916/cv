import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('712 official examples', () => {
  assert.equal(buildTrace({ s1: 'sea', s2: 'eat' }).result, 231)
  assert.equal(buildTrace({ s1: 'delete', s2: 'leet' }).result, 403)
})

// Oracle: try every subset of characters to keep in s1 and s2; the common subsequence with the largest kept ASCII sum wins.
test('712 short strings match a subset enumeration', () => {
  let state = 157
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = len => Array.from({ length: len }, () => 'abc'[rand(3)]).join('')
  const sum = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let t = 0; t < 200; t++) {
    const s1 = word(1 + rand(5)), s2 = word(1 + rand(5))
    let bestKept = 0
    for (let a = 0; a < 1 << s1.length; a++) for (let b = 0; b < 1 << s2.length; b++) {
      const k1 = [...s1].filter((_, i) => a & (1 << i)).join('')
      const k2 = [...s2].filter((_, j) => b & (1 << j)).join('')
      if (k1 === k2) bestKept = Math.max(bestKept, sum(k1))
    }
    const expected = sum(s1) + sum(s2) - 2 * bestKept
    assert.equal(buildTrace({ s1, s2 }).result, expected, JSON.stringify({ s1, s2 }))
  }
})

test('712 rejects empty strings', () => {
  assert.throws(() => parseInput('{"s1":"","s2":"a"}'))
})
