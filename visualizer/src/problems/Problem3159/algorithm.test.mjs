import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries, x) => buildTrace({ nums, queries, x }).result

test('3159 worked examples', () => {
  assert.deepEqual(solve([1, 3, 1, 7], [1, 3, 2, 4], 1), [0, -1, 2, -1])
  assert.deepEqual(solve([1, 2, 3], [10], 5), [-1])
})

test('3159 edge cases', () => {
  assert.deepEqual(solve([4], [1, 2], 4), [0, -1])
  assert.deepEqual(solve([2, 2, 2], [3, 1, 4], 2), [2, 0, -1])
  assert.throws(() => parseInput('{"nums":[1],"queries":[1],"x":0}'))
})

// Independent oracle: for each query, scan the array and count matches until the query number is reached.
function oracle(nums, queries, x) {
  return queries.map(q => {
    let seen = 0
    for (let i = 0; i < nums.length; i++) {
      if (nums[i] === x && ++seen === q) return i
    }
    return -1
  })
}

test('3159 random inputs match the scan oracle', () => {
  let seed = 3159
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(4))
    const queries = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(8))
    const x = 1 + rnd(4)
    assert.deepEqual(solve(nums, queries, x), oracle(nums, queries, x), JSON.stringify({ nums, queries, x }))
  }
})
