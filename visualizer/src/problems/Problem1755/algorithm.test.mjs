import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1755 official examples', () => {
  assert.equal(solve({ nums: [5, -7, 3, 5], goal: 6 }), 0)
  assert.equal(solve({ nums: [7, -9, 15, -2], goal: -5 }), 1)
  assert.equal(solve({ nums: [1, 2, 3], goal: -7 }), 7)
})

test('1755 a single number can be the closest sum', () => {
  assert.equal(solve({ nums: [4], goal: 3 }), 1)
  assert.equal(solve({ nums: [4], goal: 9 }), 5)
})

test('1755 rejects a goal outside the range', () => {
  assert.throws(() => parseInput('{"nums":[1],"goal":100}'))
})

// Independent oracle: test every subset of the numbers directly.
function oracle({ nums, goal }) {
  const n = nums.length
  let best = Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let sum = 0
    for (let i = 0; i < n; i++) if (mask & (1 << i)) sum += nums[i]
    best = Math.min(best, Math.abs(goal - sum))
  }
  return best
}

test('1755 seeded random inputs match a subset oracle', () => {
  let seed = 1755
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(41) - 20)
    const input = { nums, goal: rnd(81) - 40 }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
