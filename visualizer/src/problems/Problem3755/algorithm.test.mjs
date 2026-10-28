import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3755 official examples', () => {
  assert.equal(solve([3, 1, 3, 2, 0]), 4)
  assert.equal(solve([3, 2, 8, 5, 4, 14, 9, 15]), 8)
  assert.equal(solve([0]), 0)
})

test('3755 a pair of equal values is balanced only if one is even and one is odd', () => {
  assert.equal(solve([2, 2]), 0)
  assert.equal(solve([2, 3]), 0)
  assert.equal(solve([2, 2, 3, 3]), 4)
})

test('3755 rejects a negative value', () => {
  assert.throws(() => parseInput('{"nums":[-1]}'))
})

// Independent oracle: check every subarray directly for XOR zero and equal counts.
function oracle(nums) {
  let best = 0
  for (let l = 0; l < nums.length; l++) {
    let xor = 0, even = 0, odd = 0
    for (let r = l; r < nums.length; r++) {
      xor ^= nums[r]
      if (nums[r] % 2 === 0) even++; else odd++
      if (xor === 0 && even === odd) best = Math.max(best, r - l + 1)
    }
  }
  return best
}

let seed = 3755
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3755 seeded random against subarray oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => rnd(8))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
