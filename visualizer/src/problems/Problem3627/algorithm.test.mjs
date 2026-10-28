import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3627 official examples', () => {
  assert.equal(solve([2, 1, 3, 2, 1, 3]), 5)
  assert.equal(solve([1, 2, 3]), 2)
})

test('3627 one triple is its own median', () => {
  assert.equal(solve([9, 1, 4]), 4)
})

test('3627 rejects a length that is not a multiple of three', () => {
  assert.throws(() => parseInput('[1, 2, 3, 4]'))
})

// Independent oracle: try every partition of the numbers into triples and keep the largest sum of medians.
function oracle(nums) {
  const used = new Array(nums.length).fill(false)
  const best = (left) => {
    if (left === 0) return 0
    let first = used.indexOf(false)
    used[first] = true
    let top = -Infinity
    for (let b = first + 1; b < nums.length; b++) {
      if (used[b]) continue
      used[b] = true
      for (let c = b + 1; c < nums.length; c++) {
        if (used[c]) continue
        used[c] = true
        const median = [nums[first], nums[b], nums[c]].sort((p, q) => p - q)[1]
        top = Math.max(top, median + best(left - 3))
        used[c] = false
      }
      used[b] = false
    }
    used[first] = false
    return top
  }
  return best(nums.length)
}

test('3627 random arrays match a partition oracle', () => {
  let seed = 3627
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 3 * (1 + rnd(3)) }, () => 1 + rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
