import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(input).result

test('3397 official examples', () => {
  assert.equal(solve({ nums: [1, 2, 2, 3, 3, 4], k: 2 }), 6)
  assert.equal(solve({ nums: [4, 4, 4, 4], k: 1 }), 3)
})

test('3397 k above 5 is rejected', () => {
  assert.throws(() => parseInput('{"nums":[1],"k":6}'))
})

// Independent oracle: try every change in [-k, k] for every element and keep the most distinct values.
function oracle({ nums, k }) {
  const n = nums.length
  let best = 0
  const values = Array(n).fill(0)
  const go = i => {
    if (i === n) {
      best = Math.max(best, new Set(values).size)
      return
    }
    for (let d = -k; d <= k; d++) {
      values[i] = nums[i] + d
      go(i + 1)
    }
  }
  go(0)
  return best
}

test('3397 random inputs match the change-enumeration oracle', () => {
  let seed = 3397
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(5) }, () => rnd(11)), k: rnd(4) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
