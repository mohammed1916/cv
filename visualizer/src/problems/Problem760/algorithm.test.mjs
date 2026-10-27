import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('760 official example', () => {
  assert.deepEqual(buildTrace({ nums1: [12, 28, 46, 32, 50], nums2: [50, 12, 32, 46, 28] }).result, [1, 4, 3, 2, 0])
})

test('760 repeated values take their positions in order', () => {
  assert.deepEqual(buildTrace({ nums1: [1, 1, 2], nums2: [2, 1, 1] }).result, [1, 2, 0])
})

test('760 rejects lists that are not permutations', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1,3]}'))
})

// Independent oracle: for each value of nums1, the first unused position of that value in nums2.
function oracle(nums1, nums2) {
  const used = new Set()
  return nums1.map(v => {
    const j = nums2.findIndex((w, idx) => w === v && !used.has(idx))
    used.add(j)
    return j
  })
}

test('760 random permutations with repeats match an oracle', () => {
  let seed = 29
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums2 = Array.from({ length: 1 + rnd(12) }, () => rnd(6))
    const nums1 = [...nums2]
    for (let i = nums1.length - 1; i > 0; i--) { const j = rnd(i + 1); [nums1[i], nums1[j]] = [nums1[j], nums1[i]] }
    const result = buildTrace({ nums1, nums2 }).result
    assert.deepEqual(result, oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
    assert.deepEqual(result.map(j => nums2[j]), nums1)
  }
})
