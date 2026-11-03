import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3757 worked examples', () => {
  assert.equal(solve([3, 5, 6]), 4)
  assert.equal(solve([4, 4, 1, 2]), 13)
  assert.equal(solve([8, 8]), 1)
})

test('3757 rejects values outside the visualization range', () => {
  assert.throws(() => parseInput('{"nums":[16]}'))
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0,2]}'))
})

// Oracle: try every removal (index subset) and check the strength of what remains.
function oracle(nums) {
  const n = nums.length
  const total = nums.reduce((a, x) => a | x, 0)
  let count = 0
  for (let removed = 0; removed < 1 << n; removed++) {
    let rest = 0
    for (let i = 0; i < n; i++) if (!((removed >> i) & 1)) rest |= nums[i]
    if (rest < total) count++
  }
  return count % 1000000007
}

test('3757 random arrays match the removal-enumeration oracle', () => {
  let seed = 3757
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let t = 0; t < 300; t++) {
    const len = 1 + Math.floor(next() * 8)
    const nums = Array.from({ length: len }, () => 1 + Math.floor(next() * 15))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
