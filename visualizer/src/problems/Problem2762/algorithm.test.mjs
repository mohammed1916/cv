import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = text => buildTrace(parseInput(text)).result

test('2762 official examples', () => {
  assert.equal(solve('[5,4,2,4]'), 8)
  assert.equal(solve('[1,2,3]'), 6)
})

test('2762 a gap of exactly 2 is still continuous', () => {
  assert.equal(solve('[1,3]'), 3)
  assert.equal(solve('[1,4]'), 2)
})

test('2762 rejects a value outside 1 to 10', () => {
  assert.throws(() => parseInput('[11]'))
})

// Independent oracle: test every subarray by its maximum and minimum.
function oracle(nums) {
  let count = 0
  for (let a = 0; a < nums.length; a++) {
    let lo = Infinity, hi = -Infinity
    for (let b = a; b < nums.length; b++) {
      lo = Math.min(lo, nums[b]); hi = Math.max(hi, nums[b])
      if (hi - lo <= 2) count++
    }
  }
  return count
}

test('2762 random arrays match an every-subarray oracle', () => {
  let seed = 2762
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(10))
    assert.equal(solve(JSON.stringify(nums)), oracle(nums), JSON.stringify(nums))
  }
})
