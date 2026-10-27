import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (n, nums, maxDiff, queries) => buildTrace({ n, nums, max_diff: maxDiff, queries }).result

test('3532 official examples', () => {
  assert.deepEqual(solve(2, [1, 3], 1, [[0, 0], [0, 1]]), [true, false])
  assert.deepEqual(solve(4, [2, 5, 6, 8], 2, [[0, 1], [0, 2], [1, 3], [2, 3]]), [false, false, true, true])
})

test('3532 edge cases: a single node and a query from a node to itself', () => {
  assert.deepEqual(solve(1, [0], 0, [[0, 0]]), [true])
  assert.deepEqual(solve(3, [0, 10, 11], 1, [[1, 2], [0, 2]]), [true, false])
})

test('3532 rejects unsorted values and out-of-range queries', () => {
  assert.throws(() => parseInput('{"n":2,"nums":[3,1],"max_diff":1,"queries":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":2,"nums":[1,3],"max_diff":1,"queries":[[0,2]]}'))
})

// Independent oracle: connect every pair whose values differ by at most max_diff, then search for each query.
function oracle(n, nums, maxDiff, queries) {
  const linked = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => Math.abs(nums[i] - nums[j]) <= maxDiff))
  return queries.map(([u, v]) => {
    const seen = new Set([u])
    const stack = [u]
    while (stack.length) {
      const cur = stack.pop()
      for (let next = 0; next < n; next++) {
        if (linked[cur][next] && !seen.has(next)) {
          seen.add(next)
          stack.push(next)
        }
      }
    }
    return seen.has(v)
  })
}

test('3532 random graphs match a pairwise search oracle', () => {
  let seed = 3532
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => rnd(21)).sort((a, b) => a - b)
    const maxDiff = rnd(6)
    const queries = Array.from({ length: 1 + rnd(5) }, () => [rnd(n), rnd(n)])
    assert.deepEqual(solve(n, nums, maxDiff, queries), oracle(n, nums, maxDiff, queries), JSON.stringify({ nums, maxDiff, queries }))
  }
})
