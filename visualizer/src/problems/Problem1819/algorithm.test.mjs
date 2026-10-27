import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('1819 official examples', () => {
  assert.equal(solve([6, 10, 3]), 5)
  assert.equal(solve([5, 15, 40, 5, 6]), 7)
})

test('1819 a single value gives one gcd', () => {
  assert.equal(solve([9]), 1)
})

test('1819 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: enumerate every non-empty subsequence and collect its gcd.
function oracle(nums) {
  const gcdOf = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  const seen = new Set()
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    let g = 0
    for (let i = 0; i < nums.length; i++) if (mask & (1 << i)) g = gcdOf(g, nums[i])
    seen.add(g)
  }
  return seen.size
}

test('1819 random arrays match a subset-enumeration oracle', () => {
  let seed = 1819
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(30))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
