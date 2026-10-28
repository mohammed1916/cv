import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, k) => buildTrace({ s, k }).result

test('3794 official examples', () => {
  assert.equal(solve('abcd', 2), 'bacd')
  assert.equal(solve('xyz', 3), 'zyx')
  assert.equal(solve('hey', 1), 'hey')
})

test('3794 edge case: k equal to the length reverses everything', () => {
  assert.equal(solve('abcdef', 6), 'fedcba')
})

test('3794 rejects k larger than the string', () => {
  assert.throws(() => parseInput('{"s":"ab","k":3}'))
})

// Independent oracle: build the result by prepending the first k characters one at a time.
function oracle(s, k) {
  let out = ''
  for (let i = 0; i < k; i++) out = s[i] + out
  return out + s.slice(k)
}

test('3794 random strings match a prepend oracle', () => {
  let seed = 3794
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(20) + 1
    const s = Array.from({ length: n }, () => String.fromCharCode(97 + rnd(26))).join('')
    const k = rnd(n) + 1
    assert.equal(solve(s, k), oracle(s, k), `${s} ${k}`)
  }
})
