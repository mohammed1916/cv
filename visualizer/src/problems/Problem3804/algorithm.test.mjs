import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3804 official examples', () => {
  assert.equal(solve([-1, 1, 0]), 5)
  assert.equal(solve([2, -3]), 2)
})

test('3804 edge cases: a single element is always centered', () => {
  assert.equal(solve([7]), 1)
  assert.equal(solve([0]), 1)
})

test('3804 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: prefix sums give each subarray total in O(1), then scan the subarray for a matching element.
function oracle(nums) {
  const P = [0]
  for (const x of nums) P.push(P[P.length - 1] + x)
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const sum = P[r + 1] - P[l]
      let found = false
      for (let i = l; i <= r; i++) if (nums[i] === sum) { found = true; break }
      if (found) count++
    }
  }
  return count
}

test('3804 random arrays match a prefix-sum oracle', () => {
  let seed = 3804
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(20) + 1
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
