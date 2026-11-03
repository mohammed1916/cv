import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

function oracle(nums) {
  let best = -Infinity
  for (let i = 0; i < nums.length; i++) {
    let product = 1
    for (let j = i; j < nums.length; j++) {
      product *= nums[j]
      best = Math.max(best, product)
    }
  }
  return best + 0
}

test('152 sample arrays give hand-counted answers', () => {
  assert.equal(solve([2, 3, -2, 4]), 6)
  assert.equal(solve([-2, 0, -1]), 0)
  assert.equal(solve([-2]), -2)
  assert.equal(solve([-2, 3, -4]), 24)
  assert.equal(solve([-1, -1]), 1)
})

test('152 random arrays match the quadratic oracle', () => {
  let seed = 3
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 500; t++) {
    const len = 1 + rnd(12)
    const nums = Array.from({ length: len }, () => rnd(21) - 10)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})

test('152 frames record every candidate step', () => {
  const run = buildTrace({ nums: [2, -3, 4] })
  assert.equal(run.frames.filter(f => f.phase === 'candidates').length, 2)
  assert.equal(run.frames.at(-1).phase, 'done')
})

test('152 rejects malformed input', () => {
  assert.throws(() => parseInput('[]'), /1 to 200/)
  assert.throws(() => parseInput('[1, 11]'), /-10 to 10/)
  assert.throws(() => parseInput('[1, "x"]'), /-10 to 10/)
})
