import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('3589 official examples', () => {
  assert.equal(solve([1, 2, 3], 1), 2)
  assert.equal(solve([2, 3, 5, 7], 3), 4)
})

test('3589 no subarray with two primes gives zero', () => {
  assert.equal(solve([4, 6, 2, 9], 60), 0)
})

test('3589 rejects a value above the cap', () => {
  assert.throws(() => parseInput('{"nums":[61],"k":1}'))
})

// Independent oracle: list every subarray's primes, sort them, and compare the first and last after sorting.
function oracle(nums, k) {
  const isP = x => x >= 2 && [...Array(x).keys()].slice(2).every(d => x % d !== 0)
  let count = 0
  for (let l = 0; l < nums.length; l++) {
    for (let r = l; r < nums.length; r++) {
      const ps = nums.slice(l, r + 1).filter(isP).sort((a, b) => a - b)
      if (ps.length >= 2 && ps[ps.length - 1] - ps[0] <= k) count++
    }
  }
  return count
}

test('3589 random arrays match a sort-based oracle', () => {
  let seed = 3589
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let trial = 0; trial < 200; trial++) {
    const n = 1 + rnd(10)
    const nums = Array.from({ length: n }, () => 1 + rnd(60))
    const k = rnd(61)
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
