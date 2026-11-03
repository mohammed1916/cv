import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

const solve = (arr, k, threshold) => buildTrace({ arr, k, threshold }).result

// Independent oracle: recompute every window sum from scratch and compare averages with division.
function brute(arr, k, threshold) {
  let count = 0
  for (let s = 0; s + k <= arr.length; s++) {
    let total = 0
    for (let i = s; i < s + k; i++) total += arr[i]
    if (total / k >= threshold) count++
  }
  return count
}

test('sample windows meet the threshold in the expected count', () => {
  assert.equal(solve([2, 2, 2, 2, 5, 5, 5, 8], 3, 4), brute([2, 2, 2, 2, 5, 5, 5, 8], 3, 4))
  assert.equal(solve([2, 2, 2, 2, 5, 5, 5, 8], 3, 4), 3)
})

test('equality with the threshold counts as meeting it', () => {
  assert.equal(solve([4, 4, 4], 2, 4), 2)
})

test('width one compares individual values', () => {
  assert.equal(solve([1, 5, 3, 7], 1, 4), 2)
})

test('one window covering the whole array', () => {
  assert.equal(solve([3, 3, 3], 3, 3), 1)
  assert.equal(solve([3, 3, 2], 3, 3), 0)
})

test('random arrays match the brute-force oracle', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(12)
    const arr = Array.from({ length: n }, () => rnd(21))
    const k = 1 + rnd(n)
    const threshold = rnd(21)
    assert.equal(solve(arr, k, threshold), brute(arr, k, threshold), JSON.stringify({ arr, k, threshold }))
  }
})

test('the parser rejects malformed input', () => {
  assert.throws(() => parseInput('[1,2]'), /object/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":3,"threshold":1}'), /k is/)
  assert.throws(() => parseInput('{"arr":[1,-2],"k":1,"threshold":1}'), /arr is/)
  assert.throws(() => parseInput('{"arr":[1,2],"k":1,"threshold":21}'), /threshold/)
})

test('frames use declared phases and end with the count', () => {
  const run = buildTrace({ arr: [2, 2, 2, 2, 5, 5, 5, 8], k: 3, threshold: 4 })
  const ids = new Set(phases.map(p => p.id))
  for (const frame of run.frames) assert.ok(ids.has(frame.phase) && frame.activeLine >= 1)
  assert.equal(run.frames.at(-1).snapshot.result, run.result)
})
