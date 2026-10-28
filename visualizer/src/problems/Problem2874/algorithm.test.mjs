import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

// Independent oracle: check every triple i < j < k directly; a negative best means the answer is 0.
function oracle(nums) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      for (let k = j + 1; k < nums.length; k++) {
        best = Math.max(best, (nums[i] - nums[j]) * nums[k])
      }
    }
  }
  return best
}

test('2874 examples', () => {
  assert.equal(solve([12, 6, 1, 2, 7]), 77)
  assert.equal(solve([1, 10, 3, 4, 19]), 133)
  assert.equal(solve([1, 2, 3]), 0)
})

test('2874 rejects a short array', () => {
  assert.throws(() => parseInput('{"nums":[1,2]}'))
})

test('2874 random arrays match a triple-loop oracle', () => {
  let seed = 2874
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => 1 + rnd(50))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
