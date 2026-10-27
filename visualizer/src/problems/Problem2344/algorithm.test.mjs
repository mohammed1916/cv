import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, nums_divide) => buildTrace({ nums, nums_divide }).result

test('2344 official examples', () => {
  assert.equal(solve([2, 3, 2, 4, 3], [9, 6, 9, 3, 15]), 2)
  assert.equal(solve([4, 3, 6], [8, 2, 6, 10]), -1)
})

test('2344 nothing needs deleting when the smallest value already divides', () => {
  assert.equal(solve([1, 9], [6, 12]), 0)
})

test('2344 rejects a missing nums_divide list', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
})

// Independent oracle: try every subset of nums to keep, and keep the largest valid one.
function oracle(nums, divide) {
  let best = -1
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const kept = nums.filter((_, i) => mask & (1 << i))
    const smallest = Math.min(...kept)
    if (divide.every(d => d % smallest === 0)) {
      const deletions = nums.length - kept.length
      if (best === -1 || deletions < best) best = deletions
    }
  }
  return best
}

test('2344 random inputs match a subset-enumeration oracle', () => {
  let seed = 2344
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    const divide = Array.from({ length: 1 + rnd(4) }, () => 1 + rnd(12))
    assert.equal(solve(nums, divide), oracle(nums, divide), JSON.stringify({ nums, divide }))
  }
})
