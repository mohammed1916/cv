import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (nums1, nums2, k1, k2) => buildTrace({ nums1, nums2, k1, k2 }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (a, b, k1, k2) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(min_sum_squared_diff(${JSON.stringify(a)}, ${JSON.stringify(b)}, ${k1}, ${k2}))`]).toString().trim())

// Oracle: spend each operation on the currently largest difference (greedy by exchange argument, checked on small inputs).
function oracle(nums1, nums2, k1, k2) {
  const d = nums1.map((a, i) => Math.abs(a - nums2[i]))
  for (let s = 0; s < k1 + k2; s++) {
    let best = 0
    for (let i = 1; i < d.length; i++) if (d[i] > d[best]) best = i
    if (d[best] > 0) d[best]--
  }
  return d.reduce((s, x) => s + x * x, 0)
}

test('2333 worked examples', () => {
  assert.equal(solve([3, 8, 5], [1, 7, 9], 1, 2), 6)
  assert.equal(solve([2, 5, 7], [2, 5, 7], 4, 3), 0)
})

test('2333 spending more operations than the total difference gives zero', () => {
  assert.equal(solve([1, 9], [4, 1], 6, 5), 0)
})

test('2333 frames point at real python lines', () => {
  for (const f of buildTrace({ nums1: [1, 2], nums2: [4, 9], k1: 1, k2: 1 }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2333 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1,2],"k1":0,"k2":0}'))
  assert.throws(() => parseInput('{"nums1":[1],"nums2":[1],"k1":30,"k2":0}'))
})

test('2333 random inputs match a greedy oracle and the python mirror', () => {
  let seed = 2333
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 150; t++) {
    const n = 1 + rnd(5)
    const nums1 = Array.from({ length: n }, () => rnd(10))
    const nums2 = Array.from({ length: n }, () => rnd(10))
    const k1 = rnd(5), k2 = rnd(5)
    assert.equal(solve(nums1, nums2, k1, k2), oracle(nums1, nums2, k1, k2), JSON.stringify({ nums1, nums2, k1, k2 }))
    if (t < 8) assert.equal(runPy(nums1, nums2, k1, k2), oracle(nums1, nums2, k1, k2))
  }
})
