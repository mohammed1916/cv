import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

// Independent oracle: literally repeat "find the leftmost equal adjacent pair and merge it" until none is left.
function oracle(arr) {
  const a = [...arr]
  for (;;) {
    const k = a.findIndex((v, i) => i > 0 && a[i - 1] === v)
    if (k < 0) return a
    a.splice(k - 1, 2, a[k - 1] * 2)
  }
}

test('3834 official examples', () => {
  assert.deepEqual(solve([3, 1, 1, 2]), [3, 4])
  assert.deepEqual(solve([2, 2, 4]), [8])
  assert.deepEqual(solve([3, 7, 5]), [3, 7, 5])
})

test('3834 a merge cascades to the left', () => {
  assert.deepEqual(solve([1, 1, 2]), [4])
})

test('3834 rejects an empty array', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
})

test('3834 random arrays match the leftmost-merge oracle', () => {
  let seed = 3834
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(10) }, () => 1 + rnd(3))
    assert.deepEqual(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
