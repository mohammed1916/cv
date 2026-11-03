import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3655 invented example', () => {
  // [3,5,2,7] -> stride 2 over 0..3 by 2 gives [6,5,4,7]; then index 1 by 3 gives 15. XOR is 10.
  assert.equal(solve([3, 5, 2, 7], [[0, 3, 2, 2], [1, 1, 1, 3]]), 10)
})

test('3655 a stride larger than the range touches one index', () => {
  assert.equal(solve([4, 4, 4], [[0, 2, 5, 3]]), 4 ^ 4 ^ 12)
})

// Independent oracle: naive loops with BigInt, no frames.
function oracle(nums, queries) {
  const v = nums.map(BigInt)
  for (const [l, r, k, mul] of queries) for (let i = l; i <= r; i += k) v[i] = v[i] * BigInt(mul) % 1000000007n
  return Number(v.reduce((a, b) => a ^ b, 0n))
}

test('3655 random inputs match the naive oracle', () => {
  let seed = 3655
  const rand = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rand(8)
    const nums = Array.from({ length: n }, () => 1 + rand(1e9))
    const queries = Array.from({ length: 1 + rand(5) }, () => {
      const l = rand(n), r = l + rand(n - l), k = 1 + rand(n)
      return [l, r, k, 1 + rand(100000)]
    })
    assert.equal(solve(nums, queries), oracle(nums, queries))
  }
})

test('3655 rejects a query whose range leaves the array', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[0,2,3,3]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[1,0,1,3]]}'))
})
