import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace({ nums, k }).result

test('3759 worked examples', () => {
  assert.equal(solve([1, 2, 3, 4, 5], 2), 3)
  assert.equal(solve([4, 4, 1], 0), 3)
  assert.equal(solve([4, 4, 1], 1), 1)
  assert.equal(solve([7], 1), 0)
})

test('3759 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":-1}'))
})

function oracle(nums, k) {
  let count = 0
  for (const x of nums) {
    const greater = nums.filter(y => y > x).length
    if (greater >= k) count++
  }
  return count
}

test('3759 random inputs match a filter-based oracle', () => {
  let seed = 3759
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(8))
    const k = rnd(6)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
