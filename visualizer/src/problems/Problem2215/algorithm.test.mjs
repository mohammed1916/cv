import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

test('2215 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3, 3], [1, 4, 6]), [[2, 3], [4, 6]])
  assert.deepEqual(solve([5, 5], [5]), [[], []])
  assert.deepEqual(solve([0, 9], [9]), [[0], []])
})

test('2215 rejects invalid input', () => {
  assert.throws(() => parseInput('{"nums1":[],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[10],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[-1]}'))
})

test('2215 random arrays match a set-difference oracle', () => {
  let seed = 2215
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums1 = Array.from({ length: 1 + rnd(8) }, () => rnd(7))
    const nums2 = Array.from({ length: 1 + rnd(8) }, () => rnd(7))
    const a = new Set(nums1); const b = new Set(nums2)
    const expected = [[...a].filter(x => !b.has(x)).sort((x, y) => x - y), [...b].filter(x => !a.has(x)).sort((x, y) => x - y)]
    assert.deepEqual(solve(nums1, nums2), expected, JSON.stringify({ nums1, nums2 }))
  }
})

test('2215 frames reference real pseudocode and python lines', () => {
  const pyCount = python.split('\n').length
  for (const frame of buildTrace(parseInput('{"nums1":[1,2],"nums2":[2,3]}')).frames) {
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(frame.pythonLine >= 1 && frame.pythonLine <= pyCount)
  }
})
