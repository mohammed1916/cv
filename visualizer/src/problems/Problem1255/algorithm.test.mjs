import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Builds the 26-value score array from a map of letters to points.
const scoreOf = points => Array.from({ length: 26 }, (_, i) => points[String.fromCharCode(97 + i)] ?? 0)
const solve = (words, letters, score) => buildTrace({ words, letters, score }).result

test('1255 official examples', () => {
  const score1 = scoreOf({ a: 1, c: 9, d: 5, g: 3, o: 2 })
  assert.equal(solve(['dog', 'cat', 'dad', 'good'], ['a', 'a', 'c', 'd', 'd', 'd', 'g', 'o', 'o'], score1), 23)
  const score2 = scoreOf({ a: 4, b: 4, c: 4, x: 5, z: 10 })
  assert.equal(solve(['xxxz', 'ax', 'bx', 'cx'], ['z', 'a', 'b', 'c', 'x', 'x', 'x'], score2), 27)
})

test('1255 no word fits when the letters are missing', () => {
  assert.equal(solve(['abc'], ['a'], scoreOf({ a: 3, b: 3, c: 3 })), 0)
})

test('1255 rejects a score array of the wrong length', () => {
  assert.throws(() => parseInput('{"words":["a"],"letters":["a"],"score":[1,2]}'), /26/)
})

// Independent oracle: enumerate every subset of words (bitmasks), check the letter budget, sum the score.
function oracle(words, letters, score) {
  const budget = {}
  for (const l of letters) budget[l] = (budget[l] || 0) + 1
  let best = 0
  for (let mask = 0; mask < 1 << words.length; mask++) {
    const used = {}
    let total = 0
    let ok = true
    for (let i = 0; i < words.length && ok; i++) {
      if (!(mask & (1 << i))) continue
      for (const ch of words[i]) {
        used[ch] = (used[ch] || 0) + 1
        if (used[ch] > (budget[ch] || 0)) { ok = false; break }
        total += score[ch.charCodeAt(0) - 97]
      }
    }
    if (ok) best = Math.max(best, total)
  }
  return best
}

test('1255 random inputs match a subset-enumeration oracle', () => {
  let seed = 1255
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const alphabet = 'abcdefg'
  for (let t = 0; t < 300; t++) {
    const words = Array.from({ length: 1 + rnd(6) }, () => Array.from({ length: 1 + rnd(4) }, () => alphabet[rnd(alphabet.length)]).join(''))
    const letters = Array.from({ length: 1 + rnd(12) }, () => alphabet[rnd(alphabet.length)])
    const score = Array.from({ length: 26 }, () => rnd(11))
    assert.equal(solve(words, letters, score), oracle(words, letters, score), JSON.stringify({ words, letters, score }))
  }
})
