import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word1, word2) => buildTrace(parseInput(JSON.stringify({ word1, word2 }))).result

test('1771 official-style examples', () => {
  assert.equal(solve('cacb', 'cbba'), 5)
  assert.equal(solve('ab', 'ab'), 3)
  // Both halves must contribute a character, so "aa" alone cannot count.
  assert.equal(solve('aa', 'bb'), 0)
})

test('1771 a single shared letter forms a palindrome of length two', () => {
  assert.equal(solve('x', 'x'), 2)
  assert.throws(() => parseInput(JSON.stringify({ word1: 'ab', word2: '' })))
})

// Independent oracle: try every non-empty subsequence of each word, concatenate them, test for a
// palindrome directly, and keep the longest. Words are kept at most 4 letters for enumeration.
function oracle(word1, word2) {
  const subs = w => {
    const out = []
    for (let mask = 1; mask < 1 << w.length; mask++) {
      let t = ''
      for (let i = 0; i < w.length; i++) if (mask & (1 << i)) t += w[i]
      out.push(t)
    }
    return out
  }
  let best = 0
  for (const a of subs(word1)) {
    for (const b of subs(word2)) {
      const t = a + b
      if (t === [...t].reverse().join('') && t.length > best) best = t.length
    }
  }
  return best
}

test('1771 random words match a subsequence-enumeration oracle', () => {
  let seed = 1771
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const word1 = word(1 + rnd(4))
    const word2 = word(1 + rnd(4))
    assert.equal(solve(word1, word2), oracle(word1, word2), `${word1} ${word2}`)
  }
})
