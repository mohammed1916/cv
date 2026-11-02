import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, k) => buildTrace({ word, k }).result

test('3031 worked examples', () => {
  assert.equal(solve('abacaba', 3), 2)
  assert.equal(solve('abacaba', 4), 1)
  assert.equal(solve('abcbabcd', 2), 4)
})

test('3031 edge cases', () => {
  assert.equal(solve('a', 1), 1)
  assert.equal(solve('aaaa', 1), 1)
  assert.equal(solve('abab', 2), 1)
  assert.throws(() => parseInput('{"word":"ab","k":3}'))
})

// Independent oracle: the direct comparison from problem 3029, applied to every t.
function oracle(word, k) {
  const n = word.length
  for (let t = 1; ; t++) {
    if (t * k >= n) return t
    if (word.slice(t * k) === word.slice(0, n - t * k)) return t
  }
}

test('3031 random words match the direct comparison', () => {
  let seed = 3031
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(30)
    const alphabet = rnd(2) ? 'ab' : 'abc'
    const word = Array.from({ length: n }, () => alphabet[rnd(alphabet.length)]).join('')
    const k = 1 + rnd(n)
    assert.equal(solve(word, k), oracle(word, k), JSON.stringify({ word, k }))
  }
})
