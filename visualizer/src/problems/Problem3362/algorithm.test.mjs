import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3362 official examples', () => {
  assert.equal(solve({ nums: [2, 0, 2], queries: [[0, 2], [0, 2], [1, 1]] }), 1)
  assert.equal(solve({ nums: [1, 1, 1, 1], queries: [[1, 3], [0, 2], [1, 3], [1, 2]] }), 2)
  assert.equal(solve({ nums: [1, 2, 3, 4], queries: [[0, 3]] }), -1)
})

test('3362 zero values need no queries', () => {
  assert.equal(solve({ nums: [0, 0], queries: [[0, 1], [1, 1]] }), 2)
})

test('3362 rejects a range that runs past the end', () => {
  assert.throws(() => parseInput('{"nums":[1,1],"queries":[[0,2]]}'))
})

// Independent oracle: try every subset of queries to apply. Applying a query lets it lower any subset of its
// range by one, so the array can be zeroed exactly when every index is covered at least nums[i] times.
function oracle({ nums, queries }) {
  const n = nums.length
  const q = queries.length
  let best = -1
  for (let mask = 0; mask < 1 << q; mask++) {
    const cover = Array(n).fill(0)
    let applied = 0
    for (let k = 0; k < q; k++) {
      if (!(mask & (1 << k))) continue
      applied++
      for (let i = queries[k][0]; i <= queries[k][1]; i++) cover[i]++
    }
    if (cover.every((c, i) => c >= nums[i])) best = Math.max(best, q - applied)
  }
  return best
}

test('3362 seeded random inputs match a subset oracle', () => {
  let seed = 3362
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(6)
    const nums = Array.from({ length: n }, () => rnd(5))
    const queries = Array.from({ length: 1 + rnd(7) }, () => {
      const l = rnd(n)
      return [l, l + rnd(n - l)]
    })
    const input = { nums, queries }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
