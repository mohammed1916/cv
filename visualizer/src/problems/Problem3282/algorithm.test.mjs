import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3282 official examples', () => {
  assert.equal(solve([1, 3, 1, 5]), 7)
  assert.equal(solve([4, 3, 1, 3, 2]), 16)
})

test('3282 two numbers jump once', () => {
  assert.equal(solve([6, 2]), 6)
})

test('3282 rejects a single number', () => {
  assert.throws(() => parseInput('[5]'))
})

// Independent oracle: a dynamic program over jumps, where best[i] is the most score from index i to the end.
function oracle(nums) {
  const n = nums.length
  const best = new Array(n).fill(-Infinity)
  best[n - 1] = 0
  for (let i = n - 2; i >= 0; i--) {
    for (let j = i + 1; j < n; j++) best[i] = Math.max(best[i], best[j] + (j - i) * nums[i])
  }
  return best[0]
}

test('3282 random arrays match a jump dynamic program', () => {
  let seed = 3282
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(8) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
