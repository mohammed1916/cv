import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace({ nums }).result

test('3824 official examples', () => {
  assert.equal(solve([3, 7, 5]), 3)
  assert.equal(solve([1]), 1)
})

test('3824 edge case: many ones need k about the square root of n', () => {
  assert.equal(solve([1, 1, 1, 1, 1, 1, 1, 1, 1]), 3)
})

test('3824 rejects a zero value', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: scan k upward one value at a time, with no binary search, and return the first k that fits.
function oracle(nums) {
  const top = Math.max(...nums) + nums.length
  for (let k = 1; k <= top; k++) {
    let ops = 0
    for (const x of nums) ops += Math.ceil(x / k)
    if (ops <= k * k) return k
  }
  return -1
}

test('3824 random arrays match a linear-scan oracle', () => {
  let seed = 3824
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(12) + 1
    const nums = Array.from({ length: n }, () => rnd(60) + 1)
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
