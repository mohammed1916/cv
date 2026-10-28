import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2389 official examples', () => {
  assert.deepEqual(solve({ nums: [4, 5, 2, 1], queries: [3, 10, 21] }), [2, 3, 4])
  assert.deepEqual(solve({ nums: [2, 3, 4, 5], queries: [1] }), [0])
})

test('2389 a limit equal to a prefix sum includes that prefix', () => {
  assert.deepEqual(solve({ nums: [1, 1, 1], queries: [2, 3] }), [2, 3])
})

test('2389 rejects a number below 1', () => {
  assert.throws(() => parseInput('{"nums":[0],"queries":[1]}'))
})

// Independent oracle: try every subset and keep the largest size whose sum fits the limit.
function oracle({ nums, queries }) {
  return queries.map(limit => {
    let best = 0
    for (let mask = 0; mask < 1 << nums.length; mask++) {
      let sum = 0
      let size = 0
      for (let i = 0; i < nums.length; i++) {
        if ((mask >> i) & 1) {
          sum += nums[i]
          size++
        }
      }
      if (sum <= limit && size > best) best = size
    }
    return best
  })
}

test('2389 random inputs match a subset-enumeration oracle', () => {
  let seed = 2389
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(20))
    const queries = Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(60))
    const input = { nums, queries }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
