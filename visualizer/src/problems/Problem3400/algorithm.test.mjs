import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('3400 worked presets', () => {
  assert.equal(solve([2, 7, 1, 8, 2], [8, 2, 7, 1, 2]), 3)
  assert.equal(solve([4, 4, 4], [1, 2, 3]), 0)
  assert.equal(solve([6, 1, 6, 1], [1, 6, 1, 6]), 4)
})

test('3400 single element and identical arrays', () => {
  assert.equal(solve([5], [5]), 1)
  assert.equal(solve([5], [6]), 0)
  assert.equal(solve([1, 2, 3], [1, 2, 3]), 3)
})

test('3400 parser rejects bad shapes and values', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[],"nums2":[]}'))
  assert.throws(() => parseInput('{"nums1":[10],"nums2":[1]}'))
  assert.throws(() => parseInput('[1,2]'))
})

// Independent oracle: rebuild each rotated array explicitly.
function oracle(nums1, nums2) {
  const n = nums1.length
  let best = 0
  for (let shift = 0; shift < n; shift++) {
    const rotated = nums1.slice(n - shift).concat(nums1.slice(0, n - shift))
    const count = rotated.filter((value, i) => value === nums2[i]).length
    best = Math.max(best, count)
  }
  return best
}

test('3400 random inputs match a rebuild-by-rotation oracle', () => {
  let seed = 3400
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums1 = Array.from({ length: n }, () => rnd(4))
    const nums2 = Array.from({ length: n }, () => rnd(4))
    assert.equal(solve(nums1, nums2), oracle(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})

test('3400 frames keep the state the view needs', () => {
  const run = buildTrace({ nums1: [2, 7, 1], nums2: [1, 2, 7] })
  for (const frame of run.frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1)
    assert.ok(Number.isInteger(frame.pythonLine) && frame.pythonLine >= 1)
    assert.equal(frame.shifted.length, 3)
    assert.equal(frame.counts.length, 3)
    assert.ok(frame.best <= 3 && frame.count <= 3)
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).best, run.result)
})
