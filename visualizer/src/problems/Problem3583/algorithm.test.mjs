import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3583 worked examples', () => {
  assert.equal(solve([6, 3, 6]), 1)
  assert.equal(solve([0, 1, 0, 0]), 1)
  assert.equal(solve([8, 4, 2, 8, 4]), 2)
})

test('3583 rejects values above 100', () => {
  assert.throws(() => parseInput('{"nums":[1,2,101]}'))
})

// Independent oracle: test every index triple directly.
function oracle(nums) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        if (nums[i] === 2 * nums[j] && nums[k] === 2 * nums[j]) count++
      }
    }
  }
  return count % 1000000007
}

test('3583 random arrays match a triple-loop oracle', () => {
  let seed = 3583
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const spread = 1 + rnd(12)
    const nums = Array.from({ length: 3 + rnd(14) }, () => rnd(spread))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
