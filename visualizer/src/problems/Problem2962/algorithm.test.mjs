import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2962 official examples', () => {
  assert.equal(solve({ nums: [1, 3, 2, 3, 3], k: 2 }), 6)
  assert.equal(solve({ nums: [1, 4, 2, 1], k: 3 }), 0)
})

test('2962 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: count the occurrences of the maximum inside every subarray.
function oracle({ nums, k }) {
  const largest = Math.max(...nums)
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const copies = nums.slice(i, j + 1).filter(v => v === largest).length
      if (copies >= k) count++
    }
  }
  return count
}

test('2962 seeded random cases match subarray enumeration', () => {
  let seed = 2962
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(5)), k: 1 + rnd(4) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
