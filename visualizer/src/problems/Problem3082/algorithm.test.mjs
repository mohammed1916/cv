import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3082 official examples', () => {
  // The subsequences summing to 3 inside [1, 2, 3] are [1, 2] and [3]; the power sums over all subsequences to 6.
  assert.equal(solve({ nums: [1, 2, 3], k: 3 }), 6)
  // The sets summing to 5 are {2, 3} and {5}, weighted by 2^(3 - 2) and 2^(3 - 1): 2 + 4 = 6.
  assert.equal(solve({ nums: [2, 3, 5], k: 5 }), 6)
})

test('3082 no subsequence reaches k', () => {
  assert.equal(solve({ nums: [1, 1], k: 5 }), 0)
})

test('3082 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":0}'))
})

// Independent oracle: for every subsequence, count its own subsequences that sum to k by enumerating submasks.
function oracle({ nums, k }) {
  const n = nums.length
  let total = 0
  for (let S = 0; S < 1 << n; S++) {
    for (let T = S; ; T = (T - 1) & S) {
      let sum = 0
      for (let i = 0; i < n; i++) if ((T >> i) & 1) sum += nums[i]
      if (sum === k) total++
      if (T === 0) break
    }
  }
  return total % MOD
}

test('3082 seeded random inputs match a submask enumeration', () => {
  let seed = 3082
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(5)), k: 1 + rnd(10) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
