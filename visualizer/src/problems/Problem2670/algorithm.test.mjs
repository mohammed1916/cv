import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('2670 official examples', () => {
  assert.deepEqual(solve([1, 2, 3, 4, 5]), [-3, -1, 1, 3, 5])
  assert.deepEqual(solve([3, 2, 3, 4, 2]), [-2, -1, 0, 2, 3])
})

test('2670 edge case: a single element', () => {
  assert.deepEqual(solve([7]), [1])
})

test('2670 rejects empty arrays and out-of-range values', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[51]'))
  assert.throws(() => parseInput('[1.5]'))
})

// Independent oracle: build each prefix and suffix as a fresh Set and take the sizes directly.
function oracle(nums) {
  return nums.map((_, i) => new Set(nums.slice(0, i + 1)).size - new Set(nums.slice(i + 1)).size)
}

test('2670 random arrays match a fresh-set oracle', () => {
  let seed = 2670
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
