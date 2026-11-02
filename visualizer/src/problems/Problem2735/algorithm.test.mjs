import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, x) => buildTrace({ nums, x }).result

test('2735 worked examples', () => {
  assert.equal(solve([20, 1, 15], 5), 13)
  assert.equal(solve([1, 2, 3], 4), 6)
})

test('2735 edge cases', () => {
  assert.equal(solve([7], 3), 7)
  assert.equal(solve([5, 5, 5], 1000), 15)
  assert.equal(solve([9, 1], 1), 3)
})

test('2735 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[],"x":1}'))
  assert.throws(() => parseInput('{"nums":[1],"x":0}'))
})

// Independent oracle: try every rotation count from 0 to n-1 and, for each type, take the minimum
// over every index reachable by that many rotations.
function oracle(nums, x) {
  const n = nums.length
  let best = Infinity
  for (let k = 0; k < n; k++) {
    let total = k * x
    for (let t = 0; t < n; t++) {
      let cheapest = Infinity
      for (let j = 0; j <= k; j++) cheapest = Math.min(cheapest, nums[(((t - j) % n) + n) % n])
      total += cheapest
    }
    best = Math.min(best, total)
  }
  return best
}

test('2735 random inputs match a window-enumeration oracle', () => {
  let seed = 2735
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(30))
    const x = 1 + rnd(20)
    assert.equal(solve(nums, x), oracle(nums, x), JSON.stringify({ nums, x }))
  }
})
