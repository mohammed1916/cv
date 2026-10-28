import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2640 official example', () => {
  assert.deepEqual(solve([2, 3, 7, 5, 10]), [4, 10, 24, 36, 56])
})

test('2640 a single element scores twice its value', () => {
  assert.deepEqual(solve([5]), [10])
})

test('2640 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: for each prefix, find the maximum by scanning and sum the converted values.
function oracle(nums) {
  return nums.map((_, i) => {
    let total = 0
    for (let j = 0; j <= i; j++) {
      let max = 0
      for (let t = 0; t <= j; t++) max = Math.max(max, nums[t])
      total += nums[j] + max
    }
    return total
  })
}

test('2640 seeded random arrays match a rescanning oracle', () => {
  let seed = 2640
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(10))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
