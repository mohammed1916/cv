import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

test('3152 mixed parity queries', () => {
  assert.deepEqual(solve([4, 3, 1, 6], [[0, 2], [2, 3], [0, 3]]), [false, true, false])
})

test('3152 a single element range is always special', () => {
  assert.deepEqual(solve([2, 2], [[1, 1]]), [true])
})

test('3152 rejects a query with from greater than to', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[1,0]]}'))
})

// Independent oracle: check every adjacent pair inside each query range directly.
function oracle(nums, queries) {
  return queries.map(([f, t]) => {
    for (let i = f; i < t; i++) if (nums[i] % 2 === nums[i + 1] % 2) return false
    return true
  })
}

test('3152 seeded random inputs match an adjacent-pair oracle', () => {
  let seed = 3152
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(10))
    const queries = Array.from({ length: 1 + rnd(6) }, () => { const a = rnd(nums.length); const b = rnd(nums.length); return [Math.min(a, b), Math.max(a, b)] })
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
