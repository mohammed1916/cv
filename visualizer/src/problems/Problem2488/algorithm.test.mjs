import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k) => buildTrace(parseInput(JSON.stringify({ nums, k }))).result

test('2488 hand-checked examples', () => {
  // [2], [1,2] (median 2) and [1,2,3] (median 2) are the only windows with median 2.
  assert.equal(solve([1, 2, 3], 2), 3)
  // Windows [4], [1,4], [1,4,5] and [2,1,4,5] have median 4.
  assert.equal(solve([3, 2, 1, 4, 5], 4), 4)
  assert.equal(solve([1], 1), 1)
})

test('2488 rejects values that are not a permutation', () => {
  assert.throws(() => parseInput('{"nums":[1,1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[0,1],"k":1}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":3}'))
})

// Independent oracle: a window containing k has median k exactly when (smaller - larger) is 0 or 1.
function oracle(nums, k) {
  const p = nums.indexOf(k)
  let total = 0
  for (let l = 0; l <= p; l++) {
    for (let r = p; r < nums.length; r++) {
      let less = 0
      let more = 0
      for (let i = l; i <= r; i++) {
        if (nums[i] < k) less++
        else if (nums[i] > k) more++
      }
      if (less - more === 0 || less - more === 1) total++
    }
  }
  return total
}

test('2488 random permutations match the balance oracle', () => {
  let seed = 2488
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = rnd(9) + 1
    const nums = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
    }
    const k = rnd(n) + 1
    assert.equal(solve(nums, k), oracle(nums, k), JSON.stringify({ nums, k }))
  }
})
