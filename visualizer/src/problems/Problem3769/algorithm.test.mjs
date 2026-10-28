import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3769 official examples', () => {
  assert.deepEqual(solve([4, 5, 4]), [4, 4, 5])
  assert.deepEqual(solve([3, 6, 5, 8]), [8, 3, 6, 5])
})

test('3769 edge cases: a single value, and ties broken by the smaller original value', () => {
  assert.deepEqual(solve([9]), [9])
  assert.deepEqual(solve([6, 3]), [3, 6])
})

test('3769 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

// Independent oracle: reflect with an explicit bit loop instead of string reversal, then sort with a comparator.
function oracle(nums) {
  const reflect = x => { let r = 0; let y = x; while (y > 0) { r = r * 2 + (y & 1); y >>= 1 } return r }
  return [...nums].sort((a, b) => {
    const ra = reflect(a)
    const rb = reflect(b)
    if (ra !== rb) return ra - rb
    return a - b
  })
}

test('3769 random arrays match a bit-loop oracle', () => {
  let seed = 3769
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(15) + 1
    const nums = Array.from({ length: n }, () => rnd(500) + 1)
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
