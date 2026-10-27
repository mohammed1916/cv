import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2741 examples', () => {
  assert.equal(solve([1, 4, 3]), 2)
  assert.equal(solve([2, 4, 8]), 6)
})

test('2741 rejects bad input', () => {
  assert.throws(() => parseInput('{"nums":[1]}'))
  assert.throws(() => parseInput('{"nums":[2,2]}'))
  assert.throws(() => parseInput('{"nums":[101,2]}'))
})

// Independent oracle: walk every permutation depth-first and keep the ones whose neighbours divide.
function oracle(nums) {
  let count = 0
  const used = new Array(nums.length).fill(false)
  const go = (prev, depth) => {
    if (depth === nums.length) { count++; return }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      if (prev !== -1 && !(nums[prev] % nums[i] === 0 || nums[i] % nums[prev] === 0)) continue
      used[i] = true
      go(i, depth + 1)
      used[i] = false
    }
  }
  go(-1, 0)
  return count
}

test('2741 random sets match depth-first permutation oracle', () => {
  let seed = 2741
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 150; t++) {
    const pool = new Set()
    const size = 2 + rnd(5)
    while (pool.size < size) pool.add(1 + rnd(24))
    const nums = [...pool]
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
