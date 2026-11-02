import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (word, k) => buildTrace({ word, k }).result

test('3029 worked examples', () => {
  assert.equal(solve('abacaba', 3), 2)
  assert.equal(solve('abacaba', 4), 1)
  assert.equal(solve('abcbabcd', 2), 4)
})

test('3029 edge cases', () => {
  assert.equal(solve('a', 1), 1)
  assert.equal(solve('aaaa', 1), 1)
  assert.equal(solve('abcd', 4), 1)
  assert.throws(() => parseInput('{"word":"ab","k":3}'))
  assert.throws(() => parseInput('{"word":"AB","k":1}'))
})

// Independent oracle: track every string reachable after t seconds over the alphabet {a, b}.
function oracle(word, k) {
  let reachable = new Set([word])
  for (let t = 1; t <= word.length + 1; t++) {
    const next = new Set()
    for (const s of reachable) {
      for (let mask = 0; mask < 1 << k; mask++) {
        let suffix = ''
        for (let b = 0; b < k; b++) suffix += (mask >> b) & 1 ? 'b' : 'a'
        next.add(s.slice(k) + suffix)
      }
    }
    reachable = next
    if (reachable.has(word)) return t
  }
  return -1
}

test('3029 small words match the reachable-string oracle', () => {
  let seed = 3029
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 250; t++) {
    const n = 1 + rnd(7)
    const word = Array.from({ length: n }, () => 'ab'[rnd(2)]).join('')
    const k = 1 + rnd(n)
    assert.equal(solve(word, k), oracle(word, k), JSON.stringify({ word, k }))
  }
})
