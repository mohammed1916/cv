import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, cost, k) => buildTrace({ nums, cost, k }).result

// Exhaustive check: every set of cut points, each subarray priced with its index i.
function brute(nums, cost, k) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < (1 << (n - 1)); mask++) {
    let total = 0
    let prefixNums = 0
    let costSum = 0
    let count = 0
    for (let r = 0; r < n; r++) {
      prefixNums += nums[r]
      costSum += cost[r]
      if (r === n - 1 || ((mask >> r) & 1)) {
        count++
        total += (prefixNums + k * count) * costSum
        costSum = 0
      }
    }
    best = Math.min(best, total)
  }
  return best
}

test('3500 layered recurrence matches exhaustive search', () => {
  const cases = [
    [[2, 5], [3, 1], 2],
    [[1, 4, 2], [2, 2, 3], 1],
    [[3, 1, 4, 1], [5, 1, 2, 2], 3],
    [[6, 3, 5, 2, 9], [2, 7, 1, 4, 3], 7],
    [[9, 9, 1, 1, 6, 2], [1, 2, 3, 4, 5, 6], 4],
  ]
  for (const [nums, cost, k] of cases) {
    assert.equal(solve(nums, cost, k), brute(nums, cost, k), JSON.stringify({ nums, cost, k }))
  }
})

test('3500 a single element is one subarray', () => {
  assert.equal(solve([6], [3], 2), (6 + 2) * 3)
})

test('3500 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"cost":[1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"cost":[1],"k":0}'))
})
