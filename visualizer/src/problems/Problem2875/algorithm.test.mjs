import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace(parseInput(JSON.stringify({ nums, target }))).result

test('2875 official examples', () => {
  assert.equal(solve([1, 2, 3], 5), 2)
  assert.equal(solve([1, 1, 1, 2, 3], 4), 2)
  assert.equal(solve([2, 4, 6, 8], 3), -1)
})

test('2875 a target that is a whole number of copies', () => {
  assert.equal(solve([3, 1], 8), 4)
})

test('2875 rejects a target of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"target":0}'))
})

// Independent oracle: for each start in one copy, extend the subarray one value at a time up to the target.
function oracle(nums, target) {
  const n = nums.length
  const at = i => nums[i % n]
  let best = -1
  for (let start = 0; start < n; start++) {
    let sum = 0
    for (let len = 1; len <= target; len++) {
      sum += at(start + len - 1)
      if (sum === target) {
        if (best === -1 || len < best) best = len
        break
      }
      if (sum > target) break
    }
  }
  return best
}

test('2875 random inputs match a start-by-start oracle', () => {
  let seed = 2875
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(9))
    const target = 1 + rnd(120)
    assert.equal(solve(nums, target), oracle(nums, target), JSON.stringify({ nums, target }))
  }
})
