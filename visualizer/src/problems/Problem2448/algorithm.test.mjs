import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, cost) => buildTrace({ nums, cost }).result

test('2448 worked examples', () => {
  assert.equal(solve([1, 3, 5, 2], [2, 3, 1, 14]), 8)
  assert.equal(solve([2, 2, 2], [4, 1, 9]), 0)
  assert.equal(solve([1, 1, 5], [1, 1, 1]), 4)
})

test('2448 a single element costs nothing', () => {
  assert.equal(solve([9], [7]), 0)
})

test('2448 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"cost":[1]}'))
})

// Oracle: try every integer target from 1 to 50.
function oracle(nums, cost) {
  let best = Infinity
  for (let t = 1; t <= 50; t++) {
    best = Math.min(best, nums.reduce((s, x, i) => s + cost[i] * Math.abs(x - t), 0))
  }
  return best
}

test('2448 random inputs match a brute-force target oracle', () => {
  let seed = 2448
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(50))
    const cost = Array.from({ length: n }, () => 1 + rnd(100))
    assert.equal(solve(nums, cost), oracle(nums, cost), JSON.stringify({ nums, cost }))
  }
})
