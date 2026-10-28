import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3085 official examples', () => {
  assert.equal(solve({ word: 'aabcaba', k: 0 }), 3)
  assert.equal(solve({ word: 'dabdcbdcdcd', k: 2 }), 2)
  assert.equal(solve({ word: 'aaabaaa', k: 2 }), 1)
})

test('3085 a letter can be removed entirely when that is cheapest', () => {
  // Counts 5 and 1 with k = 0: deleting the single 'b' costs 1, versus 4 deletions to match 'a'.
  assert.equal(solve({ word: 'aaaaab', k: 0 }), 1)
})

test('3085 rejects bad fields', () => {
  assert.throws(() => parseInput('{"word":"ab"}'))
  assert.throws(() => parseInput('{"word":"aB","k":0}'))
  assert.throws(() => parseInput('{"word":"ab","k":6}'))
  assert.throws(() => parseInput('["ab", 0]'))
})

// Independent oracle: try every final count for every letter, keep the valid
// combinations, and take the one that deletes the fewest characters.
function oracle(word, k) {
  const counts = {}
  for (const ch of word) counts[ch] = (counts[ch] ?? 0) + 1
  const letters = Object.keys(counts)
  let best = Infinity
  const choose = (index, finals) => {
    if (index === letters.length) {
      const present = finals.filter(v => v > 0)
      if (present.length === 0 || Math.max(...present) - Math.min(...present) <= k) {
        const kept = finals.reduce((a, b) => a + b, 0)
        best = Math.min(best, word.length - kept)
      }
      return
    }
    for (let f = 0; f <= counts[letters[index]]; f++) choose(index + 1, [...finals, f])
  }
  choose(0, [])
  return best
}

test('3085 random words match an exhaustive final-count oracle', () => {
  let seed = 3085
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(12)
    let word = ''
    for (let i = 0; i < len; i++) word += 'abcd'[rnd(4)]
    const k = rnd(4)
    assert.equal(solve({ word, k }), oracle(word, k), `${word} ${k}`)
  }
})
