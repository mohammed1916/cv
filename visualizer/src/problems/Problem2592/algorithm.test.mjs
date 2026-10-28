import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2592 official examples', () => {
  assert.equal(solve([1, 3, 5, 2, 1, 3, 1]), 4)
  assert.equal(solve([1, 2, 3, 4]), 3)
})

test('2592 equal values beat nothing', () => {
  assert.equal(solve([5, 5, 5]), 0)
  assert.equal(solve([0]), 0)
})

test('2592 rejects a value above 99', () => {
  assert.throws(() => parseInput('[100]'))
})

// Independent oracle: try every arrangement of the values and keep the best count of beaten positions.
function oracle(nums) {
  let best = 0
  const used = Array(nums.length).fill(false)
  const perm = []
  const go = () => {
    if (perm.length === nums.length) {
      best = Math.max(best, perm.filter((v, i) => v > nums[i]).length)
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      perm.push(nums[i])
      go()
      perm.pop()
      used[i] = false
    }
  }
  go()
  return best
}

test('2592 random arrays match the arrangement oracle', () => {
  let seed = 2592
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(6) }, () => rnd(10))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
