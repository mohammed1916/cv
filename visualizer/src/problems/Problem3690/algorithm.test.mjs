import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

// Independent oracle: depth-limited depth-first search that tries every operation at each level.
function oracle(nums1, nums2) {
  const goal = nums2.join(',')
  const reachable = (cur, left) => {
    if (cur.join(',') === goal) return true
    if (left === 0) return false
    const n = cur.length
    for (let l = 0; l < n; l++) for (let r = l; r < n; r++) {
      const rest = [...cur.slice(0, l), ...cur.slice(r + 1)]
      for (let pos = 0; pos <= rest.length; pos++) {
        if (reachable([...rest.slice(0, pos), ...cur.slice(l, r + 1), ...rest.slice(pos)], left - 1)) return true
      }
    }
    return false
  }
  for (let depth = 0; depth <= 6; depth++) if (reachable(nums1, depth)) return depth
  return -1
}

test('3690 worked examples', () => {
  assert.equal(solve([3, 1, 2], [1, 2, 3]), 1)
  assert.equal(solve([1, 2, 3], [3, 1, 2]), 1)
  assert.equal(solve([1, 2, 3], [1, 2, 3]), 0)
})

test('3690 random small arrays match a depth-first oracle', () => {
  let seed = 3690
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 120; t++) {
    const len = 2 + rnd(4)
    const nums1 = Array.from({ length: len }, () => 1 + rnd(4))
    const nums2 = [...nums1]
    for (let i = nums2.length - 1; i > 0; i--) { const j = rnd(i + 1); [nums2[i], nums2[j]] = [nums2[j], nums2[i]] }
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})

test('3690 rejects a non-permutation and an oversized input', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1,3]}'))
  assert.throws(() => parseInput('{"nums1":[1,2,3,4,5,6,7],"nums2":[7,6,5,4,3,2,1]}'))
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
})
