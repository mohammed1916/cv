import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2831 official examples', () => {
  assert.equal(solve({ nums: [1, 3, 2, 3, 1, 3], k: 3 }), 3)
  assert.equal(solve({ nums: [1, 1, 2, 2, 1, 1], k: 2 }), 4)
})

test('2831 rejects a negative k', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":-1}'))
})

// Independent oracle: for each subarray, deleting everything except its most common value must cost at most k.
function oracle({ nums, k }) {
  let best = 0
  for (let i = 0; i < nums.length; i++) {
    for (let j = i; j < nums.length; j++) {
      const part = nums.slice(i, j + 1)
      const counts = new Map()
      for (const v of part) counts.set(v, (counts.get(v) ?? 0) + 1)
      const most = Math.max(...counts.values())
      // After deleting the other values, the equal subarray keeps only the copies of the most common value.
      if (part.length - most <= k) best = Math.max(best, most)
    }
  }
  return best
}

test('2831 seeded random cases match subarray enumeration', () => {
  let seed = 2831
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const input = { nums: Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(4)), k: rnd(6) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
