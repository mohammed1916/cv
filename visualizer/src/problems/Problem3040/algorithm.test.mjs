import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = nums => buildTrace(nums).result

test('3040 worked examples', () => {
  assert.equal(solve([3, 2, 1, 2, 3, 4]), 3)
  assert.equal(solve([3, 2, 6, 1, 4]), 2)
})

test('3040 edge cases', () => {
  assert.equal(solve([1, 1]), 1)
  assert.equal(solve([1, 2]), 1)
  assert.equal(solve([1, 2, 3, 4]), 2)
  assert.equal(solve([5, 5, 5, 5]), 2)
  assert.throws(() => parseInput('[1]'))
})

// Independent oracle: plain recursion on arrays with no memo; the first removal fixes the score.
function oracle(nums) {
  const dfs = (arr, score) => {
    if (arr.length < 2) return 0
    let best = 0
    const moves = [
      [[0, 1], arr.slice(2)],
      [[arr.length - 2, arr.length - 1], arr.slice(0, -2)],
      [[0, arr.length - 1], arr.slice(1, -1)],
    ]
    for (const [[i, j], next] of moves) {
      const sum = arr[i] + arr[j]
      if (score === null || sum === score) best = Math.max(best, 1 + dfs(next, sum))
    }
    return best
  }
  return dfs(nums, null)
}

test('3040 random inputs match a plain recursion oracle', () => {
  let seed = 3040
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const len = 2 + rnd(7)
    const nums = Array.from({ length: len }, () => 1 + rnd(5))
    assert.equal(solve(nums), oracle(nums), JSON.stringify(nums))
  }
})
