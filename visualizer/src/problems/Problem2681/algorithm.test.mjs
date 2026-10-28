import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2681 official examples', () => {
  assert.equal(solve([2, 1, 4]), 141)
  assert.equal(solve([1, 1, 1]), 7)
  // Hand-checked: seven groups of [1, 4, 3] sum to 181.
  assert.equal(solve([1, 4, 3]), 181)
})

test('2681 a single hero is its strength cubed', () => {
  assert.equal(solve([3]), 27)
})

test('2681 rejects an empty list', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: enumerate every non-empty group, take its strongest squared times weakest, and sum.
function oracle(nums) {
  const n = nums.length
  let sum = 0
  for (let mask = 1; mask < (1 << n); mask++) {
    const group = nums.filter((_, i) => mask & (1 << i))
    sum += Math.max(...group) ** 2 * Math.min(...group)
  }
  return sum % 1000000007
}

test('2681 random groups match an enumeration oracle', () => {
  let seed = 2681
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(1000))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
