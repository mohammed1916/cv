import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('4010 official examples', () => {
  assert.equal(solve([2, 3, 5]), 15)
  assert.equal(solve([4, 6, 8]), 12)
  assert.equal(solve([3, 3]), 1)
})

test('4010 a shared factor is divided out twice', () => {
  // gcd(6, 4) is 2, so the strength is 24 / 4 = 6.
  assert.equal(solve([6, 4]), 6)
})

test('4010 rejects a single number', () => {
  assert.throws(() => parseInput('{"nums":[7]}'))
})

// Independent oracle: find gcd by testing every divisor, then compute the strength as a plain ratio.
function oracle(nums) {
  const divisorGcd = (a, b) => {
    let g = 1
    for (let d = 1; d <= Math.min(a, b); d++) if (a % d === 0 && b % d === 0) g = d
    return g
  }
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      const g = divisorGcd(nums[i], nums[j])
      best = Math.max(best, (nums[i] * nums[j]) / (g * g))
    }
  }
  return best
}

test('4010 random arrays match a divisor-search oracle', () => {
  let seed = 4010
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(5) }, () => 1 + rnd(60))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
