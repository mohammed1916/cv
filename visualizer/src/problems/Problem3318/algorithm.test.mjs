import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, x) => buildTrace(parseInput(JSON.stringify({ nums, k, x }))).result

test('3318 official examples', () => {
  assert.deepEqual(solve([1, 1, 2, 2, 3, 4, 2, 3], 6, 2), [6, 10, 12])
  assert.deepEqual(solve([3, 8, 7, 8, 7, 5], 2, 2), [11, 15, 15, 15, 12])
})

test('3318 fewer distinct values than x sums the whole window', () => {
  assert.deepEqual(solve([4, 4, 9], 3, 3), [4 * 2 + 9])
})

test('3318 ties in frequency keep the larger value', () => {
  assert.deepEqual(solve([1, 2], 2, 1), [2])
})

test('3318 rejects x greater than k', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":1,"x":2}'))
})

// Independent oracle: rank each distinct value by counting how many values beat it, with no sorting.
function oracle(nums, k, x) {
  const out = []
  for (let start = 0; start + k <= nums.length; start++) {
    const cnt = new Map()
    for (let i = start; i < start + k; i++) cnt.set(nums[i], (cnt.get(nums[i]) || 0) + 1)
    let total = 0
    for (const [v, c] of cnt) {
      let beaten = 0
      for (const [u, d] of cnt) if (d > c || (d === c && u > v)) beaten++
      if (beaten < x) total += v * c
    }
    out.push(total)
  }
  return out
}

test('3318 random arrays match a rank-counting oracle', () => {
  let seed = 3318
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 1 + rnd(14)
    const nums = Array.from({ length: len }, () => 1 + rnd(6))
    const k = 1 + rnd(len)
    const x = 1 + rnd(k)
    assert.deepEqual(solve(nums, k, x), oracle(nums, k, x), JSON.stringify({ nums, k, x }))
  }
})
