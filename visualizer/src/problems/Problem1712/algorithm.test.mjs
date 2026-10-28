import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('1712 official examples', () => {
  assert.equal(solve([1, 1, 1]), 1)
  assert.equal(solve([1, 2, 2, 2, 5, 0]), 3)
  assert.equal(solve([3, 2, 1]), 0)
})

test('1712 zeros split in every valid place', () => {
  // [0,0,0,0]: all splits are valid; there are 3 ways to cut 4 elements into 3 non-empty parts.
  assert.equal(solve([0, 0, 0, 0]), 3)
})

test('1712 rejects a negative value', () => {
  assert.throws(() => parseInput('{"nums":[1,-1,2]}'), /0 to 9/)
})

// Independent oracle: try every pair of cut points and sum each part directly.
function oracle(nums) {
  const n = nums.length
  const sum = (a, b) => { let s = 0; for (let i = a; i < b; i++) s += nums[i]; return s }
  let count = 0
  for (let i = 1; i < n - 1; i++) {
    for (let j = i + 1; j < n; j++) {
      const left = sum(0, i)
      const mid = sum(i, j)
      const right = sum(j, n)
      if (left <= mid && mid <= right) count++
    }
  }
  return count % 1000000007
}

test('1712 random arrays match a direct-sum oracle', () => {
  let seed = 1712
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(12) }, () => rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
