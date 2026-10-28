import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(parseInput(JSON.stringify({ nums }))).result

test('2593 official examples', () => {
  assert.equal(solve([2, 1, 3, 4, 5, 2]), 7)
  assert.equal(solve([2, 3, 5, 1, 3, 2]), 5)
})

test('2593 a single number is its own score', () => {
  assert.equal(solve([9]), 9)
})

test('2593 rejects a value of zero', () => {
  assert.throws(() => parseInput('{"nums":[0]}'))
})

// Independent oracle: repeatedly scan the whole array for the smallest unmarked value (earliest index on ties).
function oracle(nums) {
  const n = nums.length
  const marked = Array(n).fill(false)
  let score = 0
  for (;;) {
    let pick = -1
    for (let i = 0; i < n; i++) {
      if (!marked[i] && (pick === -1 || nums[i] < nums[pick])) pick = i
    }
    if (pick === -1) break
    score += nums[pick]
    for (const j of [pick - 1, pick, pick + 1]) if (j >= 0 && j < n) marked[j] = true
  }
  return score
}

test('2593 random arrays match a rescanning oracle', () => {
  let seed = 2593
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const nums = Array.from({ length: 1 + rnd(12) }, () => 1 + rnd(100))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
