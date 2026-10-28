import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

test('2771 hand-checked examples', () => {
  // Build nums3 = [2, 2, 1]; the longest non-decreasing run is [2, 2].
  assert.equal(solve([2, 3, 1], [1, 2, 1]), 2)
  // Build nums3 = [1, 2, 3, 4].
  assert.equal(solve([1, 3, 2, 1], [2, 2, 3, 4]), 4)
  assert.equal(solve([1, 1], [2, 2]), 2)
})

test('2771 rejects mismatched lengths and values outside 1 to 20', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[1,21],"nums2":[1,2]}'))
})

// Independent oracle: try every choice of source for each index and measure the longest non-decreasing run.
function oracle(nums1, nums2) {
  const n = nums1.length
  let best = 0
  for (let mask = 0; mask < 1 << n; mask++) {
    const pick = Array.from({ length: n }, (_, i) => (mask & (1 << i) ? nums2[i] : nums1[i]))
    let run = 1
    for (let i = 0; i < n; i++) {
      if (i > 0 && pick[i] >= pick[i - 1]) run++
      else run = 1
      best = Math.max(best, run)
    }
  }
  return best
}

test('2771 random cases match the choice-enumeration oracle', () => {
  let seed = 2771
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(8) + 1
    const nums1 = Array.from({ length: n }, () => rnd(6) + 1)
    const nums2 = Array.from({ length: n }, () => rnd(6) + 1)
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
