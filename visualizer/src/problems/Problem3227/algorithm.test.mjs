import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify({ s }))).result

test('3227 official examples', () => {
  assert.equal(solve('leetcoder'), true)
  assert.equal(solve('bbcd'), false)
})

test('3227 a single vowel is a win for Alice', () => {
  assert.equal(solve('a'), true)
  assert.equal(solve('b'), false)
})

test('3227 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Abc"}'))
})

// Independent oracle: full game search. Alice removes a non-empty substring with an odd number of vowels;
// Bob removes a non-empty substring with an even number of vowels (zero allowed). A player with no move loses.
function oracle(s) {
  const isVowel = c => 'aeiou'.includes(c)
  const vowelCount = t => [...t].filter(isVowel).length
  const memo = new Map()
  const aliceWins = (t, aliceTurn) => {
    const key = t + (aliceTurn ? '|A' : '|B')
    if (memo.has(key)) return memo.get(key)
    const outcomes = []
    for (let i = 0; i < t.length; i++) {
      for (let j = i + 1; j <= t.length; j++) {
        const odd = vowelCount(t.slice(i, j)) % 2 === 1
        if (aliceTurn !== odd) continue
        outcomes.push(aliceWins(t.slice(0, i) + t.slice(j), !aliceTurn))
      }
    }
    const result = aliceTurn ? outcomes.some(Boolean) : (outcomes.length === 0 ? true : outcomes.every(Boolean))
    memo.set(key, result)
    return result
  }
  return aliceWins(s, true)
}

test('3227 random strings match a full game search', () => {
  let seed = 3227
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abcdeiou'
  for (let t = 0; t < 200; t++) {
    const s = Array.from({ length: 1 + rnd(7) }, () => letters[rnd(letters.length)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
