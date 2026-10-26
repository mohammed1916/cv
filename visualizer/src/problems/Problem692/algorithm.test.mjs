import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('692 official examples', () => {
  assert.deepEqual(buildTrace({ words: ['i', 'love', 'leetcode', 'i', 'love', 'coding'], k: 2 }).result, ['i', 'love'])
  assert.deepEqual(buildTrace({ words: ['the', 'day', 'is', 'sunny', 'the', 'the', 'the', 'sunny', 'is', 'is'], k: 4 }).result, ['the', 'is', 'sunny', 'day'])
})

test('692 random word lists match sort by (−count, word)', () => {
  let state = 3
  const rand = k => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % k }
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rand(12) }, () => 'abc'[rand(3)] + 'de'[rand(2)])
    const distinct = new Set(words).size
    const k = 1 + rand(distinct)
    const count = {}
    for (const w of words) count[w] = (count[w] ?? 0) + 1
    const expected = Object.keys(count).sort((a, b) => count[b] - count[a] || (a < b ? -1 : a > b ? 1 : 0)).slice(0, k)
    assert.deepEqual(buildTrace({ words, k }).result, expected, JSON.stringify({ words, k }))
  }
})

test('692 rejects k above the number of distinct words', () => {
  assert.throws(() => parseInput('{"words":["a","a"],"k":2}'))
})
