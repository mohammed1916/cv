import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3196 examples', () => {
  // Singleton pieces cost 1 + 2 + 3 + 4 = 10, which beats every longer piece.
  assert.equal(solve([1, 2, 3, 4]), 10)
  // Single pieces cost 1 - 1 + 1 - 1 = 0 in total, but the whole array alternates to 4.
  assert.equal(solve([1, -1, 1, -1]), 4)
})

test('3196 a single element', () => {
  assert.equal(solve([-7]), -7)
})

test('3196 rejects an empty array and an out-of-range value', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[11]'))
})

// Independent oracle: try every way to cut the array (2^(n-1) cut sets) and sum the alternating costs.
function oracle(nums) {
  const n = nums.length
  let best = -Infinity
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let total = 0
    let start = 0
    for (let i = 0; i < n; i++) {
      const cut = i === n - 1 || (mask >> i) & 1
      if (cut) {
        let cost = 0
        for (let j = start; j <= i; j++) cost += (j - start) % 2 === 0 ? nums[j] : -nums[j]
        total += cost
        start = i + 1
      }
    }
    best = Math.max(best, total)
  }
  return best
}

test('3196 random arrays match a cut-enumeration oracle', () => {
  let seed = 3196
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => rnd(21) - 10)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
