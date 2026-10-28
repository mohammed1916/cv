import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, modulo, k) => buildTrace(parseInput(JSON.stringify({ nums, modulo, k }))).result

test('2845 official examples', () => {
  assert.equal(solve([3, 2, 4], 2, 1), 3)
  assert.equal(solve([3, 1, 9, 6], 3, 0), 2)
})

test('2845 a count that is zero modulo the modulus is interesting when k is zero', () => {
  assert.equal(solve([1], 2, 0), 1)
})

test('2845 rejects k that is not below the modulo', () => {
  assert.throws(() => parseInput('{"nums":[1],"modulo":2,"k":2}'))
})

// Independent oracle: test every subarray by counting its matching elements directly.
function oracle(nums, modulo, k) {
  let total = 0
  for (let l = 0; l < nums.length; l++) {
    let cnt = 0
    for (let r = l; r < nums.length; r++) {
      if (nums[r] % modulo === k) cnt++
      if (cnt % modulo === k) total++
    }
  }
  return total
}

test('2845 seeded random inputs match an all-subarrays oracle', () => {
  let seed = 2845
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const modulo = 2 + rnd(5)
    const k = rnd(modulo)
    const nums = Array.from({ length: 1 + rnd(10) }, () => rnd(21))
    assert.equal(solve(nums, modulo, k), oracle(nums, modulo, k), JSON.stringify({ nums, modulo, k }))
  }
})
