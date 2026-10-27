import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, dist) => buildTrace(parseInput(JSON.stringify({ nums, k, dist }))).result

test('3013 hand-checked examples', () => {
  // Starts at 1 and 2 cost 2 and 6 next to the first element 1, but starts 1 and 3 need dist 2.
  assert.equal(solve([1, 3, 2, 6, 4, 2], 3, 3), 5)
  assert.equal(solve([10, 1, 2, 2, 2, 1], 4, 3), 15)
  assert.equal(solve([1, 2, 3, 4, 5, 6], 3, 1), 6)
})

test('3013 the k - 2 extra starts must lie within dist of the first one', () => {
  // With dist 1 the two chosen starts must be adjacent: {1,2} or {2,3} cost 10 each, so the total is 5 + 10.
  assert.equal(solve([5, 1, 9, 1], 3, 1), 15)
})

test('3013 rejects dist below k - 2', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4],"k":4,"dist":1}'))
})

// Independent oracle: try every set of k - 1 later starts whose spread is at most dist.
function oracle(nums, k, dist) {
  const n = nums.length
  let best = Infinity
  const choose = (from, chosen) => {
    if (chosen.length === k - 1) {
      if (chosen[chosen.length - 1] - chosen[0] <= dist) best = Math.min(best, nums[0] + chosen.reduce((a, i) => a + nums[i], 0))
      return
    }
    for (let i = from; i <= n - 1; i++) choose(i + 1, [...chosen, i])
  }
  choose(1, [])
  return best
}

test('3013 random inputs match a subset-enumeration oracle', () => {
  let seed = 3013
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 3 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    const k = 3 + rnd(n - 2)
    const dist = k - 2 + rnd(n - 2 - (k - 2) + 1)
    assert.equal(solve(nums, k, dist), oracle(nums, k, dist), JSON.stringify({ nums, k, dist }))
  }
})
