import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2537 official examples', () => {
  assert.equal(solve({ nums: [1, 1, 1, 1, 1], k: 10 }), 1)
  assert.equal(solve({ nums: [3, 1, 4, 3, 2, 2, 4], k: 2 }), 4)
})

test('2537 rejects k of zero', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0}'))
})

// Independent oracle: count equal index pairs inside every subarray directly.
function oracle({ nums, k }) {
  let count = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      let pairs = 0
      for (let a = i; a <= j; a++) for (let b = a + 1; b <= j; b++) if (nums[a] === nums[b]) pairs++
      if (pairs >= k) count++
    }
  }
  return count
}

test('2537 seeded random cases match subarray enumeration', () => {
  let seed = 2537
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => rnd(4)), k: 1 + rnd(8) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
