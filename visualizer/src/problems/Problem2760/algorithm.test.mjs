import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2760 official examples', () => {
  assert.equal(solve({ nums: [3, 2, 5, 4], threshold: 5 }), 3)
  assert.equal(solve({ nums: [1, 2], threshold: 2 }), 1)
  assert.equal(solve({ nums: [2, 3, 4, 5], threshold: 4 }), 3)
})

test('2760 rejects a value above the allowed range', () => {
  assert.throws(() => parseInput('{"nums":[11],"threshold":5}'))
})

// Independent oracle: test every subarray against the three rules directly.
function oracle({ nums, threshold }) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const part = nums.slice(i, j + 1)
      const startsEven = part[0] % 2 === 0
      const alternates = part.every((v, k) => k === 0 || v % 2 !== part[k - 1] % 2)
      const underThreshold = part.every(v => v <= threshold)
      if (startsEven && alternates && underThreshold) best = Math.max(best, part.length)
    }
  }
  return best
}

test('2760 seeded random cases match subarray enumeration', () => {
  let seed = 2760
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(10)), threshold: 1 + rnd(10) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
