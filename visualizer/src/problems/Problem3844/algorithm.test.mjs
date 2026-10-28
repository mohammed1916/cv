import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

// Independent oracle: for each substring, try every single deletion and test the result for a palindrome by reversing it.
function oracle(s) {
  let best = 0
  for (let l = 0; l < s.length; l++) {
    for (let r = l + 1; r < s.length; r++) {
      const sub = s.slice(l, r + 1)
      const works = [...sub].some((_, k) => {
        const rest = sub.slice(0, k) + sub.slice(k + 1)
        return rest === [...rest].reverse().join('')
      })
      if (works) best = Math.max(best, sub.length)
    }
  }
  return best
}

test('3844 official examples', () => {
  assert.equal(solve('abca'), 4)
  assert.equal(solve('abba'), 4)
  assert.equal(solve('zzabba'), 5)
})

test('3844 rejects an uppercase letter', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

test('3844 random strings match the delete-one oracle', () => {
  let seed = 3844
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 2 + rnd(10) }, () => 'abc'[rnd(3)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
