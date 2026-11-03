import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace({ nums, queries }).result

test('3748 worked examples', () => {
  assert.deepEqual(solve([3, 1, 2], [[0, 1], [1, 2], [0, 2]]), [2, 3, 4])
  assert.deepEqual(solve([1, 2, 2, 1], [[0, 3]]), [7])
})

// Brute force: test every subarray of the query segment for an inversion.
function brute(nums, [l, r]) {
  let count = 0
  for (let a = l; a <= r; a++) {
    for (let b = a; b <= r; b++) {
      let stable = true
      for (let i = a; i <= b && stable; i++) for (let j = i + 1; j <= b; j++) if (nums[i] > nums[j]) { stable = false; break }
      if (stable) count++
    }
  }
  return count
}

test('3748 matches brute force on generated arrays', () => {
  for (let trial = 0; trial < 120; trial++) {
    const n = 1 + (trial % 9)
    const nums = Array.from({ length: n }, (_, k) => 1 + ((trial * 7 + k * k * 3) % 9))
    const queries = []
    for (let l = 0; l < n; l += 2) queries.push([l, Math.min(n - 1, l + (trial % 5))])
    assert.deepEqual(solve(nums, queries), queries.map(q => brute(nums, q)))
  }
})

test('3748 rejects an out-of-range query', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[1,2]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"queries":[[1,0]]}'))
})
