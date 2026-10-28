import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3702 official examples', () => {
  assert.equal(solve([1, 2, 3]), 2)
  assert.equal(solve([2, 3, 4]), 3)
})

test('3702 edge cases', () => {
  assert.equal(solve([0]), 0)
  assert.equal(solve([0, 0, 3, 3, 0, 0, 0]), 6)
  assert.equal(solve([5]), 1)
})

test('3702 rejects a value outside 0 to 15', () => {
  assert.throws(() => parseInput('[16]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: try every subset of positions and keep the longest one with non-zero XOR.
function oracle(nums) {
  let best = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let xor = 0
    let size = 0
    for (let i = 0; i < nums.length; i++) {
      if (mask & (1 << i)) { xor ^= nums[i]; size++ }
    }
    if (xor !== 0 && size > best) best = size
  }
  return best
}

test('3702 random arrays match a subset-enumeration oracle', () => {
  let seed = 3702
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(16))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
