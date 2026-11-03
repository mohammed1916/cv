import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('4017 small hand cases', () => {
  // [0,3,1,2]: the single peak is index 1, so [0..2] and [0..3] contain it.
  assert.deepEqual(solve([0, 3, 1, 2], [[1, 0, 3]]), [2])
  assert.deepEqual(solve([0, 3, 1, 2], [[1, 0, 2]]), [1])
  // Replacing index 2 with 9 moves the peak to index 2, so [0..3] and [1..3] contain it.
  assert.deepEqual(solve([0, 3, 1, 2], [[2, 2, 9], [1, 0, 3]]), [2])
})

test('4017 rejects bad queries', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"queries":[[1,1,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2,3],"queries":[[3,0,1]]}'))
})

// Brute oracle: recompute peaks from scratch and test every subarray of the range.
function brute(initial, queries) {
  const nums = [...initial]
  const out = []
  const peakAt = i => i >= 1 && i <= nums.length - 2 && nums[i - 1] < nums[i] && nums[i] > nums[i + 1]
  for (const [type, a, b] of queries) {
    if (type === 2) {
      nums[a] = b
      continue
    }
    let count = 0
    for (let x = a; x <= b; x++) {
      for (let y = x + 2; y <= b; y++) {
        let hit = false
        for (let p = x + 1; p < y; p++) if (peakAt(p)) hit = true
        if (hit) count++
      }
    }
    out.push(count)
  }
  return out
}

test('4017 matches a rescan oracle on random arrays and updates', () => {
  let seed = 4017
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const n = 3 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(6))
    const queries = Array.from({ length: 1 + rnd(6) }, () => {
      if (rnd(2)) {
        const l = rnd(n - 1)
        return [1, l, l + 1 + rnd(n - 1 - l)]
      }
      return [2, rnd(n), rnd(6)]
    })
    assert.deepEqual(solve(nums, queries), brute(nums, queries), JSON.stringify({ nums, queries }))
  }
})

test('4017 frames reference valid pseudocode and python lines', () => {
  const run = buildTrace({ nums: [1, 3, 2, 5, 4], queries: [[1, 0, 4], [2, 2, 6], [1, 0, 4]] })
  const pyLines = python.split('\n').length
  for (const f of run.frames) {
    assert.ok(Number.isInteger(f.activeLine) && f.activeLine >= 1 && f.activeLine <= code.length)
    assert.ok(Number.isInteger(f.pythonLine) && f.pythonLine >= 1 && f.pythonLine <= pyLines)
  }
})
