import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const MOD = 1000000007
const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3251 hand-checked examples', () => {
  assert.equal(solve([2, 3, 2]), 4)
  assert.equal(solve([5, 5, 5, 5]), 126)
})

test('3251 a single value gives one pair per split', () => {
  // arr1 is [0], [1] or [2] when nums is [2]; arr2 takes the rest, so there are 3 pairs.
  assert.equal(solve([2]), 3)
})

test('3251 rejects a value above 6', () => {
  assert.throws(() => parseInput('{"nums":[7]}'))
})

// Independent oracle: enumerate every arr1 directly and check both monotonic conditions.
function oracle(nums) {
  let count = 0
  const arr1 = []
  const extend = i => {
    if (i === nums.length) {
      const arr2 = nums.map((x, j) => x - arr1[j])
      let ok = true
      for (let j = 0; j + 1 < nums.length && ok; j++) {
        if (arr1[j + 1] < arr1[j] || arr2[j + 1] > arr2[j]) ok = false
      }
      if (ok) count++
      return
    }
    for (let v = 0; v <= nums[i]; v++) {
      arr1.push(v)
      extend(i + 1)
      arr1.pop()
    }
  }
  extend(0)
  return count % MOD
}

test('3251 seeded random arrays match a direct enumeration', () => {
  let seed = 3251
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(5) }, () => rnd(7))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
