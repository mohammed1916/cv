import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('720 official examples', () => {
  assert.equal(buildTrace(['w', 'wo', 'wor', 'worl', 'world']).result, 'world')
  assert.equal(buildTrace(['a', 'banana', 'app', 'appl', 'ap', 'apply', 'apple']).result, 'apple')
})

// Oracle: for each word, check every prefix is in the dictionary directly.
test('720 random dictionaries match a direct prefix check', () => {
  let state = 223
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  const word = () => Array.from({ length: 1 + rand(4) }, () => 'ab'[rand(2)]).join('')
  for (let t = 0; t < 300; t++) {
    const words = [...new Set(Array.from({ length: 1 + rand(8) }, word))]
    const set = new Set(words)
    let expected = ''
    for (const w of words) {
      const ok = [...Array(w.length).keys()].every(i => set.has(w.slice(0, i + 1)))
      if (ok && (w.length > expected.length || (w.length === expected.length && w < expected))) expected = w
    }
    assert.equal(buildTrace(words).result, expected, JSON.stringify(words))
  }
})

test('720 rejects uppercase words', () => {
  assert.throws(() => parseInput('["Ab"]'))
})
