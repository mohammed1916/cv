import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, target1, target2) => buildTrace({ nums, target1, target2 }).result

test('3811 official examples', () => {
  assert.equal(solve([2, 3, 1, 4], 1, 5), 1)
  assert.equal(solve([1, 0, 0], 1, 0), 3)
  assert.equal(solve([7], 1, 7), 0)
})

test('3811 edge case: a single block equal to target1', () => {
  assert.equal(solve([4], 4, 9), 1)
})

test('3811 rejects equal targets', () => {
  assert.throws(() => parseInput('{"nums":[1],"target1":2,"target2":2}'))
})

// Independent oracle: enumerate every way to cut the array into blocks (2^(n-1) cut sets) and test the alternation directly.
function oracle(nums, target1, target2) {
  const n = nums.length
  let count = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    let ok = true
    let start = 0
    let index = 0
    for (let end = 1; end <= n && ok; end++) {
      const cut = end === n || (mask >> (end - 1) & 1)
      if (!cut) continue
      let x = 0
      for (let i = start; i < end; i++) x ^= nums[i]
      const want = index % 2 === 0 ? target1 : target2
      if (x !== want) ok = false
      index++
      start = end
    }
    if (ok) count++
  }
  return count % 1000000007
}

test('3811 random inputs match a cut-enumeration oracle', () => {
  let seed = 3811
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 200; t++) {
    const n = rnd(9) + 1
    const nums = Array.from({ length: n }, () => rnd(8))
    const target1 = rnd(8)
    let target2 = rnd(8)
    if (target2 === target1) target2 = (target1 + 1) % 8
    assert.equal(solve(nums, target1, target2), oracle(nums, target1, target2), JSON.stringify({ nums, target1, target2 }))
  }
})
