import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2945 examples', () => {
  assert.equal(solve([5, 2, 2]), 1)
  assert.equal(solve([1, 2, 3, 4]), 4)
  assert.equal(solve([4, 3, 2, 6]), 3)
})

test('2945 rejects an empty array and a value of zero', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
})

// Independent oracle: every way to cut the array into pieces (2^(n-1) cut sets), merge each piece to its sum,
// and keep the most pieces whose sums never decrease.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const sums = []
    let acc = 0
    for (let i = 0; i < n; i++) {
      acc += nums[i]
      if (i === n - 1 || (mask >> i) & 1) {
        sums.push(acc)
        acc = 0
      }
    }
    if (sums.every((s, i) => i === 0 || sums[i - 1] <= s)) best = Math.max(best, sums.length)
  }
  return best
}

test('2945 random arrays match a cut-enumeration oracle', () => {
  let seed = 2945
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
