import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (words1, words2) => buildTrace(parseInput(JSON.stringify({ words1, words2 }))).result
// Oracle: pairwise multiset subset test by deleting letters.
const subset = (b, a) => { const pool = [...a]; for (const ch of b) { const i = pool.indexOf(ch); if (i < 0) return false; pool.splice(i, 1) } return true }
const oracle = (w1, w2) => w1.filter(a => w2.every(b => subset(b, a)))
test('official examples', () => {
  const w1 = ['amazon', 'apple', 'facebook', 'google', 'leetcode']
  assert.deepEqual(solve(w1, ['e', 'o']), ['facebook', 'google', 'leetcode'])
  assert.deepEqual(solve(w1, ['l', 'e']), ['apple', 'google', 'leetcode'])
})
test('matches pairwise oracle', () => {
  let seed = 31
  const rnd = m => (seed = (seed * 1103515245 + 12345) % 2147483648) % m
  const word = max => Array.from({ length: 1 + rnd(max) }, () => 'abc'[rnd(3)]).join('')
  for (let t = 0; t < 400; t++) {
    const w1 = Array.from({ length: 1 + rnd(8) }, () => word(8)), w2 = Array.from({ length: 1 + rnd(3) }, () => word(3))
    assert.deepEqual(solve(w1, w2), oracle(w1, w2))
  }
})
test('ends done, rejects bad input', () => {
  assert.equal(buildTrace(parseInput('{"words1":["a"],"words2":["a"]}')).frames.at(-1).phase, 'done')
  assert.throws(() => parseInput('{"words1":["A"],"words2":["a"]}'))
  assert.throws(() => parseInput('{"words1":[],"words2":["a"]}'))
  assert.throws(() => parseInput('[]'))
})
