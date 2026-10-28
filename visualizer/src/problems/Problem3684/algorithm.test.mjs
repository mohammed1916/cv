import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3684 official examples', () => {
  assert.deepEqual(solve({ nums: [84, 93, 100, 77, 90], k: 3 }), [100, 93, 90])
  assert.deepEqual(solve({ nums: [84, 93, 100, 77, 93], k: 3 }), [100, 93, 84])
  assert.deepEqual(solve({ nums: [1, 1, 1, 2, 2, 2], k: 6 }), [2, 1])
})

test('3684 k larger than the distinct count keeps every distinct value', () => {
  assert.deepEqual(solve({ nums: [5, 5, 5], k: 3 }), [5])
})

test('3684 rejects a non-positive value and an out-of-range k', () => {
  assert.throws(() => parseInput('{"nums":[0,2],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: try every subset of distinct values of size at most k and keep the largest sum.
function oracle({ nums, k }) {
  const values = [...new Set(nums)]
  let best = []
  let bestSum = -1
  for (let mask = 0; mask < 1 << values.length; mask++) {
    const picked = values.filter((_, i) => mask & (1 << i))
    if (picked.length > k) continue
    const sum = picked.reduce((a, b) => a + b, 0)
    if (sum > bestSum) { bestSum = sum; best = picked }
  }
  return best.sort((a, b) => b - a)
}

test('3684 random inputs match a subset-enumeration oracle', () => {
  let seed = 3684
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(9))
    const k = 1 + rnd(len)
    assert.deepEqual(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
