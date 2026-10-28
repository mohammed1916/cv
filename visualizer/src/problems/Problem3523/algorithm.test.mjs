import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('3523 official examples', () => {
  assert.equal(solve([4, 2, 5, 3, 5]), 3)
  assert.equal(solve([1, 2, 3]), 3)
})

test('3523 a strictly decreasing array merges into one segment', () => {
  assert.equal(solve([3, 2, 1]), 1)
})

test('3523 rejects an empty array and a zero value', () => {
  assert.throws(() => parseInput('{"nums":[]}'))
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: every operation result is a partition into contiguous segments, each replaced
// by its maximum. Try every partition and keep the largest one whose maxima are non-decreasing.
function oracle(nums) {
  const n = nums.length
  let best = 0
  for (let mask = 0; mask < 1 << (n - 1); mask++) {
    const maxima = []
    let seg = [nums[0]]
    for (let i = 1; i < n; i++) {
      if (mask & (1 << (i - 1))) { maxima.push(Math.max(...seg)); seg = [nums[i]] } else seg.push(nums[i])
    }
    maxima.push(Math.max(...seg))
    if (maxima.every((v, k) => k === 0 || maxima[k - 1] <= v)) best = Math.max(best, maxima.length)
  }
  return best
}

let seed = 3523
const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }

test('3523 seeded random against partition oracle', () => {
  for (let t = 0; t < 150; t++) {
    const nums = Array.from({ length: 1 + rnd(8) }, () => 1 + rnd(9))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
