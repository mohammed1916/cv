import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('2770 official examples', () => {
  assert.equal(solve({ nums: [1, 3, 6, 4, 1, 2], target: 2 }), 3)
  assert.equal(solve({ nums: [1, 3, 6, 4, 1, 2], target: 3 }), 5)
  assert.equal(solve({ nums: [1, 3, 6, 4, 1, 2], target: 0 }), -1)
})

test('2770 a single index needs zero jumps', () => {
  assert.equal(solve({ nums: [5], target: 0 }), 0)
})

test('2770 rejects a negative target', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"target":-1}'))
})

// Independent oracle: search from index 0 toward the last index, trying every legal first jump.
function oracle({ nums, target }) {
  const n = nums.length
  const fromIndex = i => {
    if (i === n - 1) return 0
    let best = -1
    for (let j = i + 1; j < n; j++) {
      if (Math.abs(nums[j] - nums[i]) > target) continue
      const rest = fromIndex(j)
      if (rest >= 0) best = Math.max(best, 1 + rest)
    }
    return best
  }
  return fromIndex(0)
}

test('2770 random inputs match a search-from-start oracle', () => {
  let seed = 2770
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => rnd(21) - 10)
    const input = { nums, target: rnd(12) }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
