import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3008 statement examples', () => {
  assert.deepEqual(solve({ s: 'isawsquirrelnearmysquirrelhouseohmy', a: 'my', b: 'squirrel', k: 15 }), [16, 33])
  assert.deepEqual(solve({ s: 'abcd', a: 'a', b: 'a', k: 4 }), [0])
})

test('3008 rejects an empty pattern', () => {
  assert.throws(() => parseInput('{"s":"abcd","a":"","b":"a","k":1}'))
})

// Independent oracle: find every occurrence with a lookahead regex, then compare every pair of occurrences.
function oracle({ s, a, b, k }) {
  const occ = p => [...s.matchAll(new RegExp(`(?=${p})`, 'g'))].map(m => m.index)
  const As = occ(a)
  const Bs = occ(b)
  return As.filter(i => Bs.some(j => Math.abs(i - j) <= k))
}

test('3008 random cases match a regex-occurrence oracle', () => {
  let seed = 3008
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const word = len => Array.from({ length: len }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 300; t++) {
    const input = { s: word(1 + rnd(18)), a: word(1 + rnd(2)), b: word(1 + rnd(3)), k: rnd(9) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
