import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (arr, target) => buildTrace(parseInput(JSON.stringify({ arr, target }))).result

test('1477 examples with two windows and with a single window only', () => {
  assert.equal(solve([3, 2, 2, 4, 3], 3), 2)
  assert.equal(solve([7, 3, 4, 7], 7), 2)
  assert.equal(solve([4, 3, 2, 6, 2, 3, 4], 6), -1)
})

test('1477 two windows must not overlap', () => {
  // The only target-sum windows are the whole array and the middle one, which overlap.
  assert.equal(solve([1, 1, 1], 2), -1)
})

test('1477 rejects a target of zero', () => {
  assert.throws(() => parseInput('{"arr":[1],"target":0}'))
})

// Independent oracle: enumerate every pair of windows and keep the best non-overlapping pair.
function oracle(arr, target) {
  const windows = []
  for (let l = 0; l < arr.length; l++) {
    let sum = 0
    for (let r = l; r < arr.length; r++) {
      sum += arr[r]
      if (sum === target) windows.push([l, r])
    }
  }
  let best = Infinity
  for (const [l1, r1] of windows) {
    for (const [l2, r2] of windows) {
      if (r1 < l2) best = Math.min(best, (r1 - l1 + 1) + (r2 - l2 + 1))
    }
  }
  return best === Infinity ? -1 : best
}

test('1477 seeded random arrays match a window-pair oracle', () => {
  let seed = 1477
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const arr = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(6))
    const target = 1 + rnd(12)
    assert.equal(solve(arr, target), oracle(arr, target), JSON.stringify({ arr, target }))
  }
})
