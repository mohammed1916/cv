import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2407 official examples', () => {
  assert.equal(solve({ nums: [4, 2, 1, 4, 3, 4, 5, 8, 15], k: 3 }), 5)
  assert.equal(solve({ nums: [7, 4, 5, 1, 8, 12, 4, 7], k: 5 }), 4)
  assert.equal(solve({ nums: [1, 5], k: 1 }), 1)
})

test('2407 a gap larger than k breaks the run', () => {
  assert.equal(solve({ nums: [1, 4], k: 2 }), 1)
  assert.equal(solve({ nums: [1, 3], k: 2 }), 2)
})

test('2407 rejects a value above 32', () => {
  assert.throws(() => parseInput('{"nums":[33],"k":1}'))
})

// Independent oracle: the quadratic dynamic program over every earlier index.
function oracle({ nums, k }) {
  const dp = []
  nums.forEach((x, i) => {
    let best = 1
    for (let j = 0; j < i; j++) if (nums[j] < x && x - nums[j] <= k) best = Math.max(best, dp[j] + 1)
    dp.push(best)
  })
  return Math.max(...dp)
}

test('2407 random inputs match a quadratic oracle', () => {
  let seed = 2407
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(32)), k: 1 + rnd(5) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
