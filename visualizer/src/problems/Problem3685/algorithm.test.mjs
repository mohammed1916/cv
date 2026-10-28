import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3685 official examples', () => {
  assert.deepEqual(solve({ nums: [4, 3, 2, 4], k: 5 }), [false, false, true, true])
  assert.deepEqual(solve({ nums: [1, 2, 3, 4, 5], k: 3 }), [true, true, true, true, true])
})

test('3685 a single element cannot reach a larger k', () => {
  assert.deepEqual(solve({ nums: [7], k: 3 }), [false])
})

test('3685 rejects a zero value and k above the visualization cap', () => {
  assert.throws(() => parseInput('{"nums":[0,1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1],"k":201}'))
})

// Independent oracle: enumerate every subsequence of the capped array (no dynamic programming).
function oracle({ nums, k }) {
  return nums.map((_, i) => {
    const x = i + 1
    const capped = nums.map(v => Math.min(v, x))
    for (let mask = 1; mask < 1 << capped.length; mask++) {
      let sum = 0
      capped.forEach((v, j) => { if (mask & (1 << j)) sum += v })
      if (sum === k) return true
    }
    return false
  })
}

test('3685 random inputs match a subsequence enumeration oracle', () => {
  let seed = 3685
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(8)
    const nums = Array.from({ length: len }, () => 1 + rnd(12))
    const k = 1 + rnd(30)
    assert.deepEqual(solve({ nums, k }), oracle({ nums, k }), JSON.stringify({ nums, k }))
  }
})
