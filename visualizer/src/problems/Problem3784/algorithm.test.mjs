import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (s, cost) => buildTrace({ s, cost }).result

test('3784 official examples', () => {
  assert.equal(solve('aabaac', [1, 2, 3, 4, 1, 10]), 11)
  assert.equal(solve('abc', [10, 5, 8]), 13)
  assert.equal(solve('zzzzz', [67, 67, 67, 67, 67]), 0)
})

test('3784 edge case: a single character', () => {
  assert.equal(solve('q', [42]), 0)
})

test('3784 rejects uppercase letters', () => {
  assert.throws(() => parseInput('{"s":"aB","cost":[1,2]}'))
})

// Independent oracle: try every non-empty set of kept positions that spells one letter, and keep the most expensive set.
function oracle(s, cost) {
  const n = s.length
  const total = cost.reduce((a, b) => a + b, 0)
  let bestKept = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    let letter = null
    let same = true
    let kept = 0
    for (let i = 0; i < n; i++) {
      if (!(mask >> i & 1)) continue
      if (letter === null) letter = s[i]
      else if (s[i] !== letter) { same = false; break }
      kept += cost[i]
    }
    if (same && kept > bestKept) bestKept = kept
  }
  return total - bestKept
}

test('3784 random strings match a subset-enumeration oracle', () => {
  let seed = 3784
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const s = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const cost = Array.from({ length: n }, () => rnd(50) + 1)
    assert.equal(solve(s, cost), oracle(s, cost), `${s} ${JSON.stringify(cost)}`)
  }
})
