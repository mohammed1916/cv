import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, k) => buildTrace({ word, k }).result

test('2953 worked examples', () => {
  assert.equal(solve('igigee', 2), 3)
  assert.equal(solve('aaabbbccc', 3), 6)
})

test('2953 edge cases', () => {
  assert.equal(solve('a', 1), 1)
  assert.equal(solve("aa", 1), 2)
  assert.equal(solve("ac", 1), 3)
  assert.equal(solve("abc", 1), 6)
  assert.throws(() => parseInput('{"word":"ab","k":0}'))
})

// Independent oracle: test every substring against the statement's definition.
function oracle(word, k) {
  let count = 0
  for (let i = 0; i < word.length; i++) {
    for (let j = i + 1; j <= word.length; j++) {
      const t = word.slice(i, j)
      const freq = {}
      for (const ch of t) freq[ch] = (freq[ch] ?? 0) + 1
      const everyK = Object.values(freq).every(x => x === k)
      let adjacent = true
      for (let p = 1; p < t.length; p++) if (Math.abs(t.charCodeAt(p) - t.charCodeAt(p - 1)) > 2) adjacent = false
      if (everyK && adjacent) count++
    }
  }
  return count
}

test('2953 random words match a substring oracle', () => {
  let seed = 2953
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdfg'
  for (let t = 0; t < 300; t++) {
    const word = Array.from({ length: 1 + rnd(14) }, () => letters[rnd(letters.length)]).join('')
    const k = 1 + rnd(3)
    assert.equal(solve(word, k), oracle(word, k), `${word} ${k}`)
  }
})
