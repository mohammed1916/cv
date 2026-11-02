import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3350 worked examples', () => {
  assert.equal(solve([2, 5, 7, 8, 9, 2, 3, 4, 3, 1]), 3)
  assert.equal(solve([1, 2, 3, 4, 4, 4, 4, 5, 6, 7]), 2)
})

test('3350 edge cases', () => {
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([5, 4]), 1)
  assert.equal(solve([1, 2, 3, 4, 5, 6]), 3)
  assert.equal(solve([3, 3, 3]), 1)
})

test('3350 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
  assert.throws(() => parseInput('{"nums":[1,1000]}'))
})

// Oracle: try every length k from large to small and every start, checking both blocks directly.
function oracle(nums) {
  const increasing = (a, len) => {
    for (let i = a; i + 1 < a + len; i++) if (nums[i + 1] <= nums[i]) return false
    return true
  }
  for (let k = Math.floor(nums.length / 2); k >= 1; k--) {
    for (let a = 0; a + 2 * k <= nums.length; a++) {
      if (increasing(a, k) && increasing(a + k, k)) return k
    }
  }
  return 0
}

test('3350 random arrays match a brute-force oracle', () => {
  let seed = 3350
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 2 + rnd(14) }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
