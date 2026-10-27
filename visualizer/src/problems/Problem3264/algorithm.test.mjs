import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3264 official examples', () => {
  assert.deepEqual(solve({ nums: [2, 1, 3, 5, 6], k: 5, multiplier: 2 }), [8, 4, 6, 5, 6])
  assert.deepEqual(solve({ nums: [1, 2], k: 3, multiplier: 4 }), [16, 8])
})

test('3264 ties go to the first index', () => {
  assert.deepEqual(solve({ nums: [3, 3], k: 1, multiplier: 2 }), [6, 3])
})

test('3264 rejects a multiplier of zero', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":1,"multiplier":0}'))
})

// Independent oracle: sort (value, index) pairs each round and multiply the first pair.
function oracle({ nums, k, multiplier }) {
  const values = [...nums]
  for (let round = 0; round < k; round++) {
    const pairs = values.map((v, i) => [v, i]).sort((a, b) => a[0] - b[0] || a[1] - b[1])
    values[pairs[0][1]] *= multiplier
  }
  return values
}

test('3264 random inputs match a sorted-pairs oracle', () => {
  let seed = 3264
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(6) }, () => 1 + rnd(20)), k: 1 + rnd(10), multiplier: 1 + rnd(5) }
    assert.deepEqual(solve(input), oracle(input), JSON.stringify(input))
  }
})
