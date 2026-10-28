import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: for each index, sum the left side and multiply the right side exactly with BigInt.
function oracle(nums) {
  for (let i = 0; i < nums.length; i++) {
    let left = 0n
    for (let j = 0; j < i; j++) left += BigInt(nums[j])
    let right = 1n
    for (let j = i + 1; j < nums.length; j++) right *= BigInt(nums[j])
    if (left === right) return i
  }
  return -1
}

test('3862 official examples', () => {
  assert.equal(solve([2, 1, 2]), 1)
  assert.equal(solve([2, 8, 2, 2, 5]), 2)
  assert.equal(solve([1]), -1)
})

test('3862 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0,1]}'))
})

test('3862 random arrays match the exact-arithmetic oracle', () => {
  let seed = 3862
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(t % 2 ? 3 : 12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
