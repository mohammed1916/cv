import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2900 examples', () => {
  assert.deepEqual(solve({ words: ['e', 'a', 'b'], groups: [0, 0, 1] }), ['e', 'b'])
  assert.deepEqual(solve({ words: ['a', 'b', 'c', 'd'], groups: [1, 0, 1, 1] }), ['a', 'b', 'c'])
})

test('2900 a single word is its own chain', () => {
  assert.deepEqual(solve({ words: ['xy'], groups: [1] }), ['xy'])
})

test('2900 rejects a group other than 0 or 1', () => {
  assert.throws(() => parseInput('{"words":["a","b"],"groups":[0,2]}'))
})

// Independent oracle: the largest number of indices whose groups alternate, found by trying every subset.
function oracleLength({ groups }) {
  let best = 0
  for (let mask = 1; mask < 1 << groups.length; mask++) {
    const picked = groups.filter((_, i) => (mask >> i) & 1)
    if (picked.every((g, i) => i === 0 || g !== picked[i - 1])) best = Math.max(best, picked.length)
  }
  return best
}

// The result must be a word sequence that some increasing choice of indices realises with alternating groups.
function realizable(chain, { words, groups }) {
  const go = (pos, from, last) => {
    if (pos === chain.length) return true
    for (let i = from; i < words.length; i++) {
      if (words[i] !== chain[pos]) continue
      if (last !== -1 && groups[i] === groups[last]) continue
      if (go(pos + 1, i + 1, i)) return true
    }
    return false
  }
  return go(0, 0, -1)
}

test('2900 random inputs: optimal length and a realisable chain', () => {
  let seed = 2900
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const letters = 'abc'
  for (let t = 0; t < 300; t++) {
    const input = {
      words: Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: 1 + rnd(3) }, () => letters[rnd(3)]).join('')),
      groups: null,
    }
    input.groups = input.words.map(() => rnd(2))
    const chain = solve(input)
    assert.equal(chain.length, oracleLength(input), JSON.stringify(input))
    assert.ok(realizable(chain, input), JSON.stringify(input))
  }
})
