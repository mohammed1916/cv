import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('2597 official examples', () => {
  assert.equal(solve([2, 4, 6], 2), 4)
  assert.equal(solve([1], 1), 1)
})

test('2597 equal values never conflict with each other', () => {
  // Two copies of 3 differ by 0, which is never k when k is at least 1.
  assert.equal(solve([3, 3], 1), 3)
})

test('2597 rejects k outside 1 to 10', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'), /1 to 10/)
})

// Independent oracle: enumerate every subset of indices and test all pairs.
function oracle(nums, k) {
  const n = nums.length
  let count = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const chosen = []
    for (let i = 0; i < n; i++) if (mask & (1 << i)) chosen.push(nums[i])
    let ok = true
    for (let a = 0; a < chosen.length && ok; a++) {
      for (let b = a + 1; b < chosen.length && ok; b++) if (Math.abs(chosen[a] - chosen[b]) === k) ok = false
    }
    if (ok) count++
  }
  return count
}

test('2597 random inputs match a subset-enumeration oracle', () => {
  let seed = 2597
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(20))
    const k = 1 + rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
