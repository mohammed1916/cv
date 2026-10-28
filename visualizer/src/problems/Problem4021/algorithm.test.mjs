import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = s => buildTrace({ s }).result

test('4021 official examples', () => {
  assert.equal(solve('abc'), 2)
  assert.equal(solve('yb'), 3)
})

test('4021 a palindrome needs no operations', () => {
  assert.equal(solve('abba'), 0)
})

test('4021 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"Ab"}'))
})

// Independent oracle: for every rotation and every pair, try each count x of increments on the left letter
// and compute the matching count for the right letter.
function oracle(s) {
  const n = s.length
  let best = Infinity
  for (let r = 0; r < n; r++) {
    const t = [...s.slice(r) + s.slice(0, r)].map(c => c.charCodeAt(0) - 97)
    let cost = r
    for (let i = 0; i < Math.floor(n / 2); i++) {
      const a = t[i]
      const b = t[n - 1 - i]
      let pair = Infinity
      for (let x = 0; x < 26; x++) {
        const y = (((a + x - b) % 26) + 26) % 26
        pair = Math.min(pair, x + y)
      }
      cost += pair
    }
    best = Math.min(best, cost)
  }
  return best
}

test('4021 random strings match a brute-force increment oracle', () => {
  let seed = 4021
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const s = Array.from({ length: 2 + rnd(7) }, () => 'abcxyz'[rnd(6)]).join('')
    assert.equal(solve(s), oracle(s), s)
  }
})
