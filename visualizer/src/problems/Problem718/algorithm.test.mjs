import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

test('718 official examples', () => {
  assert.equal(buildTrace({ nums1: [1, 2, 3, 2, 1], nums2: [3, 2, 1, 4, 7] }).result, 3)
  assert.equal(buildTrace({ nums1: [0, 0, 0, 0, 0], nums2: [0, 0, 0, 0, 0] }).result, 5)
})

test('718 random arrays match every pair of windows', () => {
  let state = 191
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 300; t++) {
    const nums1 = Array.from({ length: 1 + rand(7) }, () => rand(3))
    const nums2 = Array.from({ length: 1 + rand(7) }, () => rand(3))
    let expected = 0
    for (let i = 0; i < nums1.length; i++) for (let j = 0; j < nums2.length; j++) {
      let k = 0
      while (i + k < nums1.length && j + k < nums2.length && nums1[i + k] === nums2[j + k]) k++
      expected = Math.max(expected, k)
    }
    assert.equal(buildTrace({ nums1, nums2 }).result, expected, JSON.stringify({ nums1, nums2 }))
  }
})

test('718 rejects values above 100', () => {
  assert.throws(() => parseInput('{"nums1":[101],"nums2":[1]}'))
})
