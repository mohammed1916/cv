import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

function checkFrames(run) {
  const pyLines = python.trim().split('\n').length
  for (const frame of run.frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyLines)
    assert.equal(typeof frame.message, 'string')
  }
  assert.equal(run.frames.at(-1).phase, 'done')
}

// Brute force: compare every pair i < j by distance, then by the index pair.
function oracle(nums1, nums2) {
  let best = null
  for (let i = 0; i < nums1.length; i++) {
    for (let j = i + 1; j < nums1.length; j++) {
      const d = Math.abs(nums1[i] - nums1[j]) + Math.abs(nums2[i] - nums2[j])
      if (best === null || d < best.d) best = { d, pair: [i, j] }
    }
  }
  return best.pair
}

// Second brute force with explicit lexicographic tie-breaking across all pairs.
function oracleLex(nums1, nums2) {
  let best = null
  for (let i = 0; i < nums1.length; i++) {
    for (let j = i + 1; j < nums1.length; j++) {
      const d = Math.abs(nums1[i] - nums1[j]) + Math.abs(nums2[i] - nums2[j])
      const better = best === null || d < best.d || (d === best.d && (i < best.pair[0] || (i === best.pair[0] && j < best.pair[1])))
      if (better) best = { d, pair: [i, j] }
    }
  }
  return best.pair
}

test('2613 local presets match the brute-force oracle', () => {
  assert.deepEqual(solve([1, 4, 2, 7, 5], [3, 1, 6, 2, 4]), oracleLex([1, 4, 2, 7, 5], [3, 1, 6, 2, 4]))
  assert.deepEqual(solve([0, 3, 6, 9], [0, 3, 6, 9]), [0, 1])
})

test('2613 ties go to the smallest index pair', () => {
  // Points 0 and 1 coincide at (2,5), so their distance is 0.
  assert.deepEqual(solve([2, 2, 8], [5, 5, 5]), [0, 1])
  // Pairs [0, 1] and [0, 2] are both at distance 4; [0, 1] is the smaller pair.
  assert.deepEqual(solve([0, 4, 0], [0, 0, 4]), oracleLex([0, 4, 0], [0, 0, 4]))
})

test('2613 random point sets match the brute-force oracle', () => {
  let seed = 2613
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 400; t++) {
    const n = 2 + rnd(7)
    const nums1 = Array.from({ length: n }, () => rnd(7) - 3)
    const nums2 = Array.from({ length: n }, () => rnd(7) - 3)
    assert.deepEqual(solve(nums1, nums2), oracleLex(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})

test('2613 frame invariants hold', () => {
  checkFrames(buildTrace({ nums1: [1, 4, 2, 7, 5], nums2: [3, 1, 6, 2, 4] }))
})

test('2613 rejects mismatched lengths', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
})
