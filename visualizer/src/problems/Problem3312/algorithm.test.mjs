import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3312 official examples', () => {
  assert.deepEqual(solve([2, 3, 4], [0, 2, 2]), [1, 2, 2])
  assert.deepEqual(solve([4, 3, 12, 8], [0, 4]), [1, 4])
})

test('3312 queries index the sorted list', () => {
  assert.deepEqual(solve([6, 6], [0]), [6])
})

test('3312 rejects a query past the last pair', () => {
  assert.throws(() => parseInput('{"nums":[2,3,4],"queries":[3]}'))
})

// Independent oracle: gcd by trying every divisor, then sort a copy and index it.
function oracle(nums, queries) {
  const gcdByDivisors = (a, b) => {
    let best = 1
    for (let d = 1; d <= Math.min(a, b); d++) if (a % d === 0 && b % d === 0) best = d
    return best
  }
  const values = []
  for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) values.push(gcdByDivisors(nums[i], nums[j]))
  values.sort((a, b) => a - b)
  return queries.map(q => values[q])
}

test('3312 random inputs match a divisor-based oracle', () => {
  let seed = 3312
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(6) }, () => 1 + rnd(60))
    const pairs = nums.length * (nums.length - 1) / 2
    const queries = Array.from({ length: 1 + rnd(4) }, () => rnd(pairs))
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
