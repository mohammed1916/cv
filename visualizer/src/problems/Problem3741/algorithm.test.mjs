import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3741 worked examples', () => {
  assert.equal(solve([1, 2, 1, 1, 3]), 6)
  assert.equal(solve([1, 2, 3]), -1)
  assert.equal(solve([1, 1, 1]), 4)
  assert.equal(solve([2, 2, 1, 2, 2, 2]), 4)
})

test('3741 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[10]}'))
})

function oracle(nums) {
  let best = -1
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) for (let k = j + 1; k < nums.length; k++) {
    if (nums[i] === nums[j] && nums[j] === nums[k]) {
      const d = Math.abs(i - j) + Math.abs(j - k) + Math.abs(k - i)
      if (best === -1 || d < best) best = d
    }
  }
  return best
}

test('3741 random arrays match a triple-enumeration oracle', () => {
  let seed = 3741
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 400; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(3))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
