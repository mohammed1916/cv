import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3708 official examples', () => {
  assert.equal(solve([1, 1, 1, 1, 2, 3, 5, 1]), 5)
  assert.equal(solve([5, 2, 7, 9, 16]), 5)
  assert.equal(solve([1000000000, 1000000000, 1000000000]), 2)
})

test('3708 a run of two always counts and a run can start late', () => {
  assert.equal(solve([7, 1, 1, 2]), 3)
  assert.equal(solve([1, 5, 9]), 2)
})

test('3708 rejects a short array', () => {
  assert.throws(() => parseInput('{"nums":[1,1]}'))
})

// Independent oracle: test every contiguous subarray directly.
function oracle(nums) {
  let best = Math.min(2, nums.length)
  for (let l = 0; l < nums.length; l++) {
    for (let r = l + 2; r < nums.length; r++) {
      let ok = true
      for (let k = l + 2; k <= r; k++) if (nums[k] !== nums[k - 1] + nums[k - 2]) { ok = false; break }
      if (ok) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

let seed = 3708
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3708 seeded random against subarray oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 3 + rnd(8) }, () => 1 + rnd(6))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
