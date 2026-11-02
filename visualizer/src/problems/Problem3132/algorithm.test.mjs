import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('3132 worked examples', () => {
  assert.equal(solve([4, 20, 16, 12, 8], [14, 18, 10]), -2)
  assert.equal(solve([3, 5, 5, 3], [7, 7]), 2)
})

test('3132 edge cases', () => {
  assert.equal(solve([1, 1, 1], [5]), 4)
  assert.equal(solve([2, 9, 9], [9]), 0)
  assert.throws(() => parseInput('{"nums1":[1,2,3],"nums2":[1,2]}'))
})

// Independent oracle: try shifts from -300 upward and check whether some pair removal matches.
function oracle(nums1, nums2) {
  const target = [...nums2].sort((a, b) => a - b).join(',')
  const n = nums1.length
  for (let x = -300; x <= 300; x++) {
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      const rest = nums1.filter((_, t) => t !== i && t !== j).map(v => v + x).sort((a, b) => a - b).join(',')
      if (rest === target) return x
    }
  }
  return null
}

test('3132 random inputs match the shift oracle', () => {
  let seed = 3132
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = 3 + rnd(4)
    const nums1 = Array.from({ length: n }, () => rnd(21) - 10)
    const kept = nums1.slice(0, n).filter((_, i) => i !== 0 && i !== n - 1)
    const shift = rnd(11) - 5
    const nums2 = kept.map(v => v + shift)
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})
