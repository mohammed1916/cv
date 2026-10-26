import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace(parseInput(JSON.stringify(s))).result
// Oracle: a cut after position i is valid iff the prefix and suffix share no letter.
function oracle(s) {
  const sizes = []; let prev = 0
  for (let i = 1; i <= s.length; i++) {
    const a = new Set(s.slice(0, i)), b = new Set(s.slice(i))
    if (![...a].some(c => b.has(c))) { sizes.push(i - prev); prev = i }
  }
  return sizes
}
test('official examples', () => {
  assert.deepEqual(solve('ababcbacadefegdehijhklij'), [9, 7, 8])
  assert.deepEqual(solve('eccbbbbdec'), [10])
})
test('random strings vs prefix/suffix oracle', () => {
  let seed = 11
  const rnd = n => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) % n
  for (let t = 0; t < 500; t++) {
    const s = Array.from({ length: 1 + rnd(20) }, () => 'abcdef'[rnd(1 + rnd(6))]).join('')
    assert.deepEqual(solve(s), oracle(s), s)
    assert.equal(solve(s).reduce((a, b) => a + b, 0), s.length)
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('""'), /lowercase/)
  assert.throws(() => parseInput('"aB"'), /lowercase/)
  assert.throws(() => parseInput('5'), /string/)
})
