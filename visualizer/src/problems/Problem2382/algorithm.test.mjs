import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, removeQueries) => buildTrace({ nums, remove_queries: removeQueries }).result

test('2382 official example', () => {
  assert.deepEqual(solve([1, 2, 5, 6, 1], [0, 3, 2, 4, 1]), [14, 7, 2, 2, 0])
})

test('2382 edge cases: one value, and removals from the right first', () => {
  assert.deepEqual(solve([9], [0]), [0])
  assert.deepEqual(solve([3, 2, 1], [2, 1, 0]), [5, 3, 0])
})

test('2382 rejects a removal list that is not a permutation', () => {
  assert.throws(() => parseInput('{"nums":[1,2],"remove_queries":[0,0]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"remove_queries":[0,2]}'))
})

// Independent oracle: after each removal, scan the remaining positions and find the largest run sum directly.
function oracle(nums, removeQueries) {
  const removed = Array(nums.length).fill(false)
  return removeQueries.map(q => {
    removed[q] = true
    let best = 0
    let run = 0
    nums.forEach((v, i) => {
      if (removed[i]) run = 0
      else {
        run += v
        best = Math.max(best, run)
      }
    })
    return best
  })
}

test('2382 random removals match a direct scan oracle', () => {
  let seed = 2382
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(100))
    const order = Array.from({ length: n }, (_, i) => i)
    for (let i = n - 1; i > 0; i--) {
      const j = rnd(i + 1)
      ;[order[i], order[j]] = [order[j], order[i]]
    }
    assert.deepEqual(solve(nums, order), oracle(nums, order), JSON.stringify({ nums, order }))
  }
})
