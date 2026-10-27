import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3171 official examples', () => {
  assert.equal(solve([1, 2, 4, 5], 3), 0)
  assert.equal(solve([1, 3, 1, 3], 2), 1)
})

test('3171 edge cases', () => {
  assert.equal(solve([7], 1), 6)
  assert.equal(solve([8, 8], 8), 0)
})

test('3171 rejects zero values and out of range k', () => {
  assert.throws(() => parseInput('{"nums":[0],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":256}'))
})

// Independent oracle: examine every subarray directly, computing its OR by reduction.
function oracle(nums, k) {
  let best = Infinity
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const or = nums.slice(i, j + 1).reduce((a, b) => a | b, 0)
      best = Math.min(best, Math.abs(or - k))
    }
  }
  return best
}

test('3171 random arrays match a direct subarray scan', () => {
  let seed = 3171
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(255))
    const k = 1 + rnd(255)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
