import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('2871 official examples', () => {
  assert.equal(solve([1, 0, 2, 0, 1, 2]), 3)
  assert.equal(solve([5, 7, 1, 3]), 1)
})

test('2871 a single value is one subarray', () => {
  assert.equal(solve([0]), 1)
})

test('2871 rejects values above 63', () => {
  assert.throws(() => parseInput('[64]'))
})

// Independent oracle: dynamic programming over every split point, keeping the lowest total score
// and, among equal scores, the largest number of subarrays.
function oracle(nums) {
  const n = nums.length
  const best = [{ score: 0, count: 0 }]
  for (let i = 1; i <= n; i++) {
    let choice = null
    for (let j = 0; j < i; j++) {
      let and = -1
      for (let t = j; t < i; t++) and &= nums[t]
      const cand = { score: best[j].score + and, count: best[j].count + 1 }
      if (choice === null || cand.score < choice.score || (cand.score === choice.score && cand.count > choice.count)) choice = cand
    }
    best.push(choice)
  }
  return best[n].count
}

test('2871 random arrays match the split-point oracle', () => {
  let seed = 2871
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(16))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
