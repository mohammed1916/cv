import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result
const adv = (res, nums2) => res.filter((x, i) => x > nums2[i]).length

// Oracle: try every permutation of nums1.
function best(nums1, nums2) {
  let top = 0
  const used = Array(nums1.length).fill(false); const cur = []
  const go = () => {
    if (cur.length === nums1.length) { top = Math.max(top, adv(cur, nums2)); return }
    for (let i = 0; i < nums1.length; i++) if (!used[i]) { used[i] = true; cur.push(nums1[i]); go(); cur.pop(); used[i] = false }
  }
  go(); return top
}

test('official examples', () => {
  assert.deepEqual(solve([2, 7, 11, 15], [1, 10, 4, 11]), [2, 11, 7, 15])
  assert.deepEqual(solve([12, 24, 8, 32], [13, 25, 32, 11]), [24, 32, 8, 12])
})

test('result is a permutation with the maximum advantage', () => {
  for (let t = 0; t < 300; t++) {
    const n = 1 + Math.floor(Math.random() * 7)
    const a = Array.from({ length: n }, () => Math.floor(Math.random() * 12)); const b = Array.from({ length: n }, () => Math.floor(Math.random() * 12))
    const r = solve(a, b)
    assert.deepEqual([...r].sort((x, y) => x - y), [...a].sort((x, y) => x - y))
    assert.equal(adv(r, b), best(a, b), JSON.stringify({ a, b }))
  }
})

test('trace shape', () => {
  const r = buildTrace(parseInput('{"nums1":[1],"nums2":[2]}'))
  assert.equal(r.frames[0].phase, 'start'); assert.equal(r.frames.at(-1).phase, 'done')
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1,2]}'))
  assert.throws(() => parseInput('{"nums1":[],"nums2":[]}'))
  assert.throws(() => parseInput('{"nums1":[-1],"nums2":[1]}'))
  assert.throws(() => parseInput('[1]'))
})
