import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2, x) => buildTrace({ nums1, nums2, x }).result

test('2809 official examples', () => {
  assert.equal(solve([1, 2, 3], [1, 2, 3], 4), 3)
  assert.equal(solve([1, 2, 3], [3, 3, 3], 4), -1)
})

test('2809 edge cases', () => {
  // Zero the only element at time 1: the sum drops from 5 + 1 to 0.
  assert.equal(solve([5], [1], 0), 1)
  // Already within the limit at time 0.
  assert.equal(solve([0], [0], 0), 0)
})

test('2809 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums1": [1], "nums2": [1, 2], "x": 3}'), /same length/)
  assert.throws(() => parseInput('{"nums1": [1], "nums2": [1], "x": -1}'), /0 to 200/)
  assert.throws(() => parseInput('{"nums1": [1.5], "nums2": [1], "x": 3}'), /integers/)
})

// Independent oracle: try every sequence of optional zeroings for each time up to 6.
function oracle(nums1, nums2, x) {
  const n = nums1.length
  for (let t = 0; t <= 6; t++) {
    const choices = (n + 1) ** t
    for (let code = 0; code < choices; code++) {
      let digits = code
      const a = [...nums1]
      for (let s = 1; s <= t; s++) {
        for (let i = 0; i < n; i++) a[i] += nums2[i]
        const d = digits % (n + 1)
        digits = Math.floor(digits / (n + 1))
        if (d > 0) a[d - 1] = 0
      }
      if (sum(a) <= x) return t
    }
  }
  return -1
}

const sum = values => values.reduce((p, q) => p + q, 0)

test('2809 random arrays match a brute-force oracle', () => {
  let seed = 2809
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(3)
    const nums1 = Array.from({ length: n }, () => rnd(5))
    const nums2 = Array.from({ length: n }, () => rnd(4))
    const x = rnd(13)
    assert.equal(solve(nums1, nums2, x), oracle(nums1, nums2, x), JSON.stringify({ nums1, nums2, x }))
  }
})
