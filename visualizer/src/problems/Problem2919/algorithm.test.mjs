import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2919 official examples', () => {
  assert.equal(solve([2, 3, 0, 0, 2], 4), 3)
  assert.equal(solve([0, 1, 3, 3], 5), 2)
  assert.equal(solve([1, 1, 2], 1), 0)
})

test('2919 edge case: fewer than three values needs nothing', () => {
  assert.equal(solve([1, 2], 5), 0)
})

test('2919 rejects an empty array and a non-integer k', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"k":2.5}'))
})

// Independent oracle: try every increment vector with each index raised by 0 to k, and keep the cheapest
// vector whose every subarray of length 3 or more has a maximum of at least k.
function oracle(nums, k) {
  const n = nums.length
  let best = Infinity
  const vec = new Array(n).fill(0)
  const beautiful = arr => {
    for (let i = 0; i < n; i++) {
      for (let j = i + 2; j < n; j++) {
        let mx = -Infinity
        for (let t = i; t <= j; t++) mx = Math.max(mx, arr[t])
        if (mx < k) return false
      }
    }
    return true
  }
  const walk = i => {
    if (i === n) {
      const arr = nums.map((v, idx) => v + vec[idx])
      if (beautiful(arr)) best = Math.min(best, vec.reduce((a, b) => a + b, 0))
      return
    }
    for (let x = 0; x <= k; x++) { vec[i] = x; walk(i + 1) }
    vec[i] = 0
  }
  walk(0)
  return best
}

test('2919 random arrays match an exhaustive increment search', () => {
  let seed = 2919
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = []
    const len = 1 + rnd(5)
    for (let i = 0; i < len; i++) nums.push(rnd(5))
    const k = 1 + rnd(4)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
