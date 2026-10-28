import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2420 official examples', () => {
  assert.deepEqual(solve([2, 1, 1, 1, 3, 4, 1], 2), [2, 3])
  assert.deepEqual(solve([2, 1, 1, 2], 2), [])
})

test('2420 k of one checks only the immediate neighbours', () => {
  assert.deepEqual(solve([1, 2, 3], 1), [1])
})

test('2420 rejects k larger than half the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3,4],"k":3}'))
})

// Independent oracle: test each candidate index by scanning its k neighbours on both sides.
function oracle(nums, k) {
  const out = []
  for (let i = k; i < nums.length - k; i++) {
    let ok = true
    for (let t = i - k; t < i - 1 && ok; t++) if (nums[t] < nums[t + 1]) ok = false
    for (let t = i + 1; t < i + k && ok; t++) if (nums[t] > nums[t + 1]) ok = false
    if (ok) out.push(i)
  }
  return out
}

test('2420 seeded random arrays match a neighbour-scan oracle', () => {
  let seed = 2420
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 2 + rnd(11) }, () => 1 + rnd(10))
    const k = 1 + rnd(Math.floor(nums.length / 2))
    assert.deepEqual(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
