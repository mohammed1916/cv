import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('2343 worked examples', () => {
  assert.deepEqual(solve(['102', '473', '251', '814'], [[1, 1], [2, 3], [4, 2], [1, 2]]), [2, 2, 1, 0])
  assert.deepEqual(solve(['24', '37', '96', '04'], [[2, 1], [2, 2]]), [3, 0])
})

test('2343 ties break by original index', () => {
  assert.deepEqual(solve(['11', '01', '21'], [[1, 1], [2, 1], [3, 1]]), [0, 1, 2])
})

test('2343 rejects unequal digit lengths', () => {
  assert.throws(() => parseInput('{"nums":["1","22"],"queries":[[1,1]]}'))
})

// Oracle: numeric comparison with BigInt instead of string comparison.
function oracle(nums, queries) {
  return queries.map(([k, trim]) => nums
    .map((s, i) => ({ v: BigInt(s.slice(-trim)), i }))
    .sort((a, b) => (a.v < b.v ? -1 : a.v > b.v ? 1 : a.i - b.i))[k - 1].i)
}

test('2343 random inputs match a BigInt oracle', () => {
  let seed = 2343
  const rnd = k => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % k }
  for (let t = 0; t < 200; t++) {
    const width = 1 + rnd(6)
    const nums = Array.from({ length: 1 + rnd(8) }, () => Array.from({ length: width }, () => rnd(10)).join(''))
    const queries = Array.from({ length: 1 + rnd(4) }, () => [1 + rnd(nums.length), 1 + rnd(width)])
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
