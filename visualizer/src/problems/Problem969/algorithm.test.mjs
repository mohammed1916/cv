import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Replay the flips on a copy of the input: the test checks the result rather than one fixed answer.
function applyFlips(arr, flips) {
  const a = [...arr]
  for (const k of flips) {
    for (let i = 0, j = k - 1; i < j; i++, j--) [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

test('969 example sorts with flips', () => {
  const arr = [3, 2, 4, 1]
  const { result } = buildTrace(arr)
  assert.deepEqual(applyFlips(arr, result), [1, 2, 3, 4])
})

test('969 an already sorted array needs no flips', () => {
  assert.deepEqual(buildTrace([1, 2, 3]).result, [])
})

test('969 rejects values that are not a permutation', () => {
  assert.throws(() => parseInput('[1,1,2]'))
})

test('969 random permutations are sorted within the flip budget', () => {
  let seed = 67
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const arr = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) { const j = rnd(i + 1); [arr[i], arr[j]] = [arr[j], arr[i]] }
    const { result } = buildTrace(arr)
    assert.deepEqual(applyFlips(arr, result), [...arr].sort((x, y) => x - y), JSON.stringify(arr))
    assert.ok(result.length <= 2 * n, JSON.stringify(arr))
    assert.ok(result.every(k => k >= 1 && k <= n))
  }
})
