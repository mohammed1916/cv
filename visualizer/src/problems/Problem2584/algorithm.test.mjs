import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('2584 official examples', () => {
  assert.equal(solve([4, 7, 8, 15, 3, 5]), 2)
  assert.equal(solve([4, 7, 15, 8]), -1)
})

test('2584 a leading one is a valid split at index 0', () => {
  assert.equal(solve([1, 2, 4]), 0)
})

test('2584 rejects a single value', () => {
  assert.throws(() => parseInput('{"nums":[5]}'))
})

// Independent oracle: multiply the products with BigInt and test gcd directly for each split.
function oracle(nums) {
  const gcdBig = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  for (let i = 0; i < nums.length - 1; i++) {
    let prefix = 1n
    let suffix = 1n
    for (let k = 0; k <= i; k++) prefix *= BigInt(nums[k])
    for (let k = i + 1; k < nums.length; k++) suffix *= BigInt(nums[k])
    if (gcdBig(prefix, suffix) === 1n) return i
  }
  return -1
}

test('2584 random arrays match a BigInt gcd oracle', () => {
  let seed = 2584
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(7) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
