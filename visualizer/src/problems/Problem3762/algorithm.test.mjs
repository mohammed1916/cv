import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, k, queries) => buildTrace({ nums, k, queries }).result

test('3762 worked examples', () => {
  assert.deepEqual(solve([2, 5, 8, 11], 3, [[0, 3], [1, 2]]), [4, 1])
  assert.deepEqual(solve([2, 5, 6, 9], 3, [[0, 2], [2, 3]]), [-1, 1])
  assert.deepEqual(solve([6, 3, 9], 3, [[0, 2], [0, 0]]), [2, 0])
})

test('3762 rejects out-of-range input', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"k":0,"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"k":2,"queries":[[1,0]]}'))
})

// Oracle: when the remainders agree, try every integer target level and keep the cheapest.
function oracle(nums, k, [l, r]) {
  const part = nums.slice(l, r + 1)
  if (part.some(x => x % k !== part[0] % k)) return -1
  const levels = part.map(x => Math.floor(x / k))
  let best = Infinity
  for (let t = Math.min(...levels); t <= Math.max(...levels); t++) {
    best = Math.min(best, levels.reduce((s, v) => s + Math.abs(v - t), 0))
  }
  return best
}

test('3762 random inputs match the target-enumeration oracle', () => {
  let seed = 3762
  const next = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }
  for (let t = 0; t < 300; t++) {
    const len = 1 + Math.floor(next() * 6)
    const k = 1 + Math.floor(next() * 4)
    const nums = Array.from({ length: len }, () => 1 + Math.floor(next() * 20))
    const queries = []
    for (let q = 0; q < 4; q++) {
      const l = Math.floor(next() * len)
      queries.push([l, l + Math.floor(next() * (len - l))])
    }
    assert.deepEqual(solve(nums, k, queries), queries.map(qr => oracle(nums, k, qr)), JSON.stringify({ nums, k, queries }))
  }
})
