import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2576 official examples', () => {
  assert.equal(solve([3, 5, 2, 4]), 2)
  assert.equal(solve([9, 2, 5, 4]), 4)
  assert.equal(solve([7, 6, 8]), 0)
})

test('2576 a single value cannot be marked', () => {
  assert.equal(solve([5]), 0)
})

test('2576 rejects values outside 1 to 100', () => {
  assert.throws(() => parseInput('{"nums":[0,3]}'))
})

// Independent oracle: exhaustive search over all sets of disjoint pairs.
function oracle(nums) {
  const n = nums.length
  const used = new Array(n).fill(false)
  let best = 0
  const go = count => {
    best = Math.max(best, count)
    for (let a = 0; a < n; a++) {
      if (used[a]) continue
      for (let b = 0; b < n; b++) {
        if (b === a || used[b] || 2 * nums[a] > nums[b]) continue
        used[a] = used[b] = true
        go(count + 1)
        used[a] = used[b] = false
      }
    }
  }
  go(0)
  return 2 * best
}

test('2576 random arrays match an exhaustive oracle', () => {
  let seed = 2576
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(7) }, () => 1 + rnd(12))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
