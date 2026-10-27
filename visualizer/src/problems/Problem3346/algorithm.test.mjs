import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, numOperations) => buildTrace(parseInput(JSON.stringify({ nums, k, numOperations }))).result

test('3346 hand-checked examples', () => {
  // 4 and 5 are within 1 of the target 4, and 1 cannot reach it, so the best frequency is 2.
  assert.equal(solve([1, 4, 5], 1, 2), 2)
  // Target 20 already has two equal values; the single operation cannot add a third (11 is too far).
  assert.equal(solve([5, 11, 20, 20], 5, 1), 2)
  assert.equal(solve([7], 0, 0), 1)
})

test('3346 with no operations the answer is the largest existing count', () => {
  assert.equal(solve([2, 2, 9, 9, 9], 3, 0), 3)
})

test('3346 rejects more operations than elements', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"numOperations":3}'))
})

// Independent oracle: try every change (each element moves by -k..k, at most numOperations of them move).
function oracle(nums, k, numOperations) {
  const n = nums.length
  const deltas = Array.from({ length: 2 * k + 1 }, (_, i) => i - k)
  let best = 0
  const pick = (i, changed, finals) => {
    if (i === n) {
      const counts = new Map()
      for (const v of finals) counts.set(v, (counts.get(v) || 0) + 1)
      best = Math.max(best, ...counts.values())
      return
    }
    for (const d of deltas) {
      const used = changed + (d !== 0 ? 1 : 0)
      if (used > numOperations) continue
      pick(i + 1, used, [...finals, nums[i] + d])
    }
  }
  pick(0, 0, [])
  return best
}

test('3346 random inputs match an exhaustive-change oracle', () => {
  let seed = 3346
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(5)
    const nums = Array.from({ length: n }, () => 1 + rnd(12))
    const k = rnd(4)
    const numOperations = rnd(n + 1)
    assert.equal(solve(nums, k, numOperations), oracle(nums, k, numOperations), JSON.stringify({ nums, k, numOperations }))
  }
})
