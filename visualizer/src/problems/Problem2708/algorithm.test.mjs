import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

// Independent oracle: try every non-empty subset and keep the largest product.
function oracle(nums) {
  let best = -Infinity
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let product = 1
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) product *= nums[i]
    best = Math.max(best, product)
  }
  return best
}

test('2708 examples', () => {
  assert.equal(solve([3, -1, -5, 2, 5, -9]), 1350)
  assert.equal(solve([-4, -5, -4]), 20)
  assert.equal(solve([0, -1]), 0)
})

test('2708 rejects values outside the range', () => {
  assert.throws(() => parseInput('{"nums":[10]}'))
})

test('2708 random groups match a subset oracle', () => {
  let seed = 2708
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(19) - 9)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
