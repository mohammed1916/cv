import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target) => buildTrace({ nums, target }).result

test('1 sample inputs return the expected pairs', () => {
  assert.deepEqual(solve([3, 8, 5, 11], 13), [1, 2])
  assert.deepEqual(solve([4, 1, 4, 9], 8), [0, 2])
  assert.equal(solve([1, 2, 3], 10), null)
})

test('1 negative values and zero sums are handled', () => {
  assert.deepEqual(solve([-5, 0, 7], 2), [0, 2])
  assert.deepEqual(solve([0, 0], 0), [0, 1])
})

test('1 rejects malformed input', () => {
  assert.throws(() => parseInput('{"nums":[1],"target":2}'), /nums/)
  assert.throws(() => parseInput('{"nums":[1,2],"target":"3"}'), /target/)
  assert.throws(() => parseInput('[1,2]'), /object/)
})

// Independent oracle: check every pair; the answer must be a valid pair, and none must exist when the oracle finds none.
test('1 random arrays match a brute-force oracle', () => {
  let seed = 7
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(8)
    const nums = Array.from({ length: len }, () => rnd(21) - 10)
    const target = rnd(41) - 20
    const input = JSON.stringify({ nums, target })
    parseInput(input)
    const got = solve(nums, target)
    let exists = false
    for (let i = 0; i < len; i++) for (let j = i + 1; j < len; j++) if (nums[i] + nums[j] === target) exists = true
    if (!exists) assert.equal(got, null, input)
    else {
      assert.ok(Array.isArray(got), input)
      assert.ok(got[0] < got[1], input)
      assert.equal(nums[got[0]] + nums[got[1]], target, input)
    }
  }
})
