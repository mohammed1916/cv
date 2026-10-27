import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('1674 statement examples', () => {
  assert.equal(solve({ nums: [1, 2, 4, 3], limit: 4 }), 1)
  assert.equal(solve({ nums: [1, 2, 2, 1], limit: 2 }), 2)
  assert.equal(solve({ nums: [1, 2, 1, 2], limit: 2 }), 0)
})

test('1674 rejects an odd length', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"limit":3}'))
})

// Independent oracle: for each target sum, decide each pair's cost by searching replacement values directly.
function oracle({ nums, limit }) {
  const n = nums.length
  let best = Infinity
  for (let x = 2; x <= 2 * limit; x++) {
    let total = 0
    for (let i = 0; i < n / 2; i++) {
      const a = nums[i]
      const b = nums[n - 1 - i]
      if (a + b === x) continue
      let one = false
      for (let y = 1; y <= limit && !one; y++) if (a + y === x || y + b === x) one = true
      total += one ? 1 : 2
    }
    best = Math.min(best, total)
  }
  return best
}

test('1674 random cases match a direct-search oracle', () => {
  let seed = 1674
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const limit = 1 + rnd(8)
    const half = 1 + rnd(5)
    const nums = Array.from({ length: 2 * half }, () => 1 + rnd(limit))
    const input = { nums, limit }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
