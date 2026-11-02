import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3745 worked examples', () => {
  assert.equal(solve([1, 5, 3, 2]), 6)
  assert.equal(solve([1, 2, 3, 4]), 1)
  assert.equal(solve([0, 0, 0]), 0)
  assert.equal(solve([-1, -2, -3]), 0)
})

test('3745 rejects too few elements', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

function oracle(nums) {
  let best = null
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) {
    const v = nums[i] + nums[j] - nums[k]
    if (best === null || v > best) best = v
  }
  return best
}

test('3745 random arrays match a triple-enumeration oracle', () => {
  let seed = 3745
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(6) }, () => rnd(41) - 20)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
