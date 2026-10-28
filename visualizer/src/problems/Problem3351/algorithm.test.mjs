import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code } from './algorithm.js'

const solve = arr => buildTrace(parseInput(JSON.stringify(arr))).result

test('3351 official examples', () => {
  assert.equal(solve([1, 2, 1]), 14)
  assert.equal(solve([3, 4, 5]), 40)
})

test('3351 a single element is a good subsequence', () => {
  assert.equal(solve([7]), 7)
  assert.equal(solve([2, 2]), 4)
})

test('3351 rejects bad input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('[0]'))
  assert.throws(() => parseInput('[1.5]'))
})

test('3351 every frame points at a real pseudocode line', () => {
  for (const frame of buildTrace([1, 2, 3, 2]).frames) {
    assert.ok(Number.isInteger(frame.activeLine) && frame.activeLine >= 1 && frame.activeLine <= code.length)
  }
})

// Independent oracle: try every subset of positions and keep the good ones.
function oracle(nums) {
  const n = nums.length
  let total = 0
  for (let mask = 1; mask < 1 << n; mask++) {
    const picked = []
    for (let b = 0; b < n; b++) if ((mask >> b) & 1) picked.push(nums[b])
    let good = true
    for (let i = 0; i + 1 < picked.length; i++) {
      if (Math.abs(picked[i] - picked[i + 1]) !== 1) good = false
    }
    if (good) total = (total + picked.reduce((a, b) => a + b, 0)) % 1000000007
  }
  return total
}

test('3351 random arrays match the subset oracle', () => {
  let seed = 3351
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let k = 0; k < 150; k++) {
    const length = 1 + rnd(10)
    const arr = Array.from({ length }, () => 1 + rnd(6))
    assert.equal(solve(arr), oracle(arr), JSON.stringify(arr))
  }
})
