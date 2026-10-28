import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify(nums))).result

test('3671 official examples', () => {
  assert.equal(solve([1, 2, 3]), 10)
  assert.equal(solve([4, 6]), 12)
})

test('3671 equal values do not form increasing subsequences together', () => {
  assert.equal(solve([7, 7]), 14)
})

test('3671 rejects a zero value and an empty array', () => {
  assert.throws(() => parseInput('[0,1]'))
  assert.throws(() => parseInput('[]'))
})

// Independent oracle: enumerate every subsequence, keep the strictly increasing ones, and sum their GCDs.
function oracle(nums) {
  const gcdAll = a => a.reduce((x, y) => { let p = x, q = y; while (q) [p, q] = [q, p % q]; return p })
  let total = 0
  for (let mask = 1; mask < 1 << nums.length; mask++) {
    const sub = nums.filter((_, i) => mask & (1 << i))
    if (sub.some((v, i) => i > 0 && v <= sub[i - 1])) continue
    total = (total + gcdAll(sub)) % 1000000007
  }
  return total
}

test('3671 random arrays match a subset-enumeration oracle', () => {
  let seed = 3671
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const nums = Array.from({ length: 1 + rnd(9) }, () => 1 + rnd(40))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
