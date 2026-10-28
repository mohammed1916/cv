import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, queries) => buildTrace(parseInput(JSON.stringify({ nums, queries }))).result

test('3911 official examples', () => {
  assert.deepEqual(solve([1, 4, 7], [[0, 2, 1], [1, 1, 2], [0, 0, 3]]), [2, 6, 6])
  assert.deepEqual(solve([2, 5, 8], [[0, 1, 2], [1, 2, 1], [0, 2, 4]]), [6, 2, 12])
  assert.deepEqual(solve([3, 6], [[0, 1, 1], [1, 1, 3]]), [2, 8])
})

test('3911 a query with no evens returns the plain k-th even', () => {
  assert.deepEqual(solve([1, 3, 5], [[0, 2, 4]]), [8])
})

test('3911 rejects an unsorted nums array', () => {
  assert.throws(() => parseInput('{"nums":[3,1],"queries":[[0,1,1]]}'), /strictly increasing/)
})

// Independent oracle: write out the evens, delete the removed ones, and read the k-th survivor.
function oracle(nums, queries) {
  return queries.map(([l, r, k]) => {
    const removed = new Set(nums.slice(l, r + 1).filter(x => x % 2 === 0))
    let found = 0
    for (let e = 2; ; e += 2) {
      if (removed.has(e)) continue
      found++
      if (found === k) return e
    }
  })
}

test('3911 random inputs match a list-and-delete oracle', () => {
  let seed = 3911
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const size = 1 + rnd(8)
    const set = new Set()
    while (set.size < size) set.add(1 + rnd(40))
    const nums = [...set].sort((a, b) => a - b)
    const queries = Array.from({ length: 1 + rnd(6) }, () => {
      const l = rnd(size)
      const r = l + rnd(size - l)
      return [l, r, 1 + rnd(20)]
    })
    assert.deepEqual(solve(nums, queries), oracle(nums, queries), JSON.stringify({ nums, queries }))
  }
})
