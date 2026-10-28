import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2817 official examples', () => {
  assert.equal(solve({ nums: [4, 3, 2, 4], x: 2 }), 0)
  assert.equal(solve({ nums: [5, 3, 2, 10, 15], x: 1 }), 1)
  assert.equal(solve({ nums: [1, 2, 3, 4], x: 3 }), 3)
})

test('2817 with x equal to zero a value pairs with itself', () => {
  assert.equal(solve({ nums: [7, 2, 9], x: 0 }), 0)
})

test('2817 rejects x out of range', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"x":2}'))
})

// Independent oracle: check every pair whose indices are at least x apart.
function oracle({ nums, x }) {
  let best = null
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j < nums.length; j++) {
      if (Math.abs(i - j) < x) continue
      const gap = Math.abs(nums[i] - nums[j])
      if (best === null || gap < best) best = gap
    }
  }
  return best
}

test('2817 random inputs match a pairwise oracle', () => {
  let seed = 2817
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(7) }, () => 1 + rnd(20))
    const x = rnd(nums.length)
    const input = { nums, x }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
