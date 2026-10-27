import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('1004 official examples', () => {
  assert.equal(solve([1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2), 6)
  assert.equal(solve([0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3), 10)
})

test('1004 k of zero keeps only runs of ones', () => {
  assert.equal(solve([0, 1, 1, 0, 1], 0), 2)
  assert.equal(solve([1, 1, 1], 0), 3)
})

test('1004 rejects values other than 0 and 1', () => {
  assert.throws(() => parseInput('{"nums":[2],"k":0}'))
})

// Independent oracle: try every start and end pair and count the zeros directly.
function oracle(nums, k) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      let zeros = 0
      for (let t = i; t <= j; t++) if (nums[t] === 0) zeros++
      if (zeros <= k) best = Math.max(best, j - i + 1)
    }
  }
  return best
}

test('1004 random binary arrays match a brute-force oracle', () => {
  let seed = 1004
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(20) }, () => rnd(2))
    const k = rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
