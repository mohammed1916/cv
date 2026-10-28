import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2602 official examples', () => {
  assert.deepEqual(solve({ nums: [3, 1, 6, 8], queries: [1, 5] }), [14, 10])
  assert.deepEqual(solve({ nums: [2, 9, 6, 3], queries: [10] }), [20])
})

test('2602 a query equal to every number costs nothing', () => {
  assert.deepEqual(solve({ nums: [4, 4], queries: [4] }), [0])
})

test('2602 rejects a value above 20', () => {
  assert.throws(() => parseInput('{"nums":[21],"queries":[1]}'))
})

// Independent oracle: add up the distance from every number to the target directly.
function oracle({ nums, queries }) {
  return queries.map(target => nums.reduce((sum, v) => sum + Math.abs(v - target), 0))
}

test('2602 random inputs match a direct distance sum', () => {
  let seed = 2602
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(20))
    const queries = Array.from({ length: 1 + rnd(5) }, () => 1 + rnd(20))
    const input = { nums, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
