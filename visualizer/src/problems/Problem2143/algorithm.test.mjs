import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace({ nums1, nums2 }).result

test('2143 a single index has one range; equal zeros give two choices', () => {
  assert.equal(solve([3], [3]), 0)
  assert.equal(solve([3], [5]), 0)
  assert.equal(solve([0], [0]), 2)
})

test('2143 two equal values count every choice that balances', () => {
  // The enumeration oracle below supplies the expected totals for these two inputs.
  assert.equal(solve([1, 2], [1, 2]), buildBrute([1, 2], [1, 2]))
  assert.equal(solve([2, 1, 3], [1, 2, 3]), buildBrute([2, 1, 3], [1, 2, 3]))
})

test('2143 the parser rejects mismatched or out-of-range lists', () => {
  assert.throws(() => parseInput('{"nums1":[1,2],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[10],"nums2":[1]}'))
  assert.throws(() => parseInput('{"nums1":[],"nums2":[]}'))
  assert.throws(() => parseInput('[1]'))
})

// Independent oracle: enumerate every range and every choice mask, and compare the two sums directly.
function buildBrute(nums1, nums2) {
  const n = nums1.length
  let total = 0
  for (let l = 0; l < n; l++) {
    for (let r = l; r < n; r++) {
      const len = r - l + 1
      for (let mask = 0; mask < 1 << len; mask++) {
        let s1 = 0
        let s2 = 0
        for (let k = 0; k < len; k++) {
          if (mask >> k & 1) s1 += nums1[l + k]
          else s2 += nums2[l + k]
        }
        if (s1 === s2) total++
      }
    }
  }
  return total % 1000000007
}

test('2143 random inputs match the enumeration oracle', () => {
  let seed = 2143
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(7)
    const nums1 = Array.from({ length: len }, () => rnd(10))
    const nums2 = Array.from({ length: len }, () => rnd(10))
    assert.equal(solve(nums1, nums2), buildBrute(nums1, nums2), JSON.stringify({ nums1, nums2 }))
  }
})

test('2143 frame invariants hold', () => {
  const run = buildTrace({ nums1: [1, 4, 2, 2], nums2: [2, 1, 3, 2] })
  const pyLines = python.trim().split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length, f.phase)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines, f.phase)
    assert.ok(f.table.every(e => e.w > 0))
  }
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).total, run.result)
})
