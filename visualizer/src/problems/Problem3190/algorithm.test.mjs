import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3190 official examples', () => {
  assert.equal(solve([1, 2, 3, 4]), 3)
  assert.equal(solve([3, 6, 9]), 0)
})

test('3190 a single number and a remainder of two', () => {
  assert.equal(solve([5]), 1)
  assert.equal(solve([2]), 1)
})

test('3190 rejects a value of zero', () => {
  assert.throws(() => parseInput('[0, 3]'))
})

// Independent oracle: search outward by distance for the nearest multiple of three, one number at a time.
function oracle(nums) {
  let total = 0
  for (const x of nums) {
    for (let d = 0; ; d++) {
      if (((x - d) % 3 + 3) % 3 === 0 || ((x + d) % 3 + 3) % 3 === 0) {
        total += d
        break
      }
    }
  }
  return total
}

test('3190 random lists match a distance-search oracle', () => {
  let seed = 3190
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
