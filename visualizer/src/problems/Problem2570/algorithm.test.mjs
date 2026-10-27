import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums1, nums2) => buildTrace(parseInput(JSON.stringify({ nums1, nums2 }))).result

test('2570 official examples', () => {
  assert.deepEqual(solve([[1, 2], [2, 3], [4, 5]], [[1, 4], [3, 2], [4, 1]]), [[1, 6], [2, 3], [3, 2], [4, 6]])
  assert.deepEqual(solve([[2, 4], [3, 6], [5, 5]], [[1, 3], [4, 3]]), [[1, 3], [2, 4], [3, 6], [4, 3], [5, 5]])
})

test('2570 disjoint ids are kept as they are', () => {
  assert.deepEqual(solve([[1, 7]], [[2, 9]]), [[1, 7], [2, 9]])
})

test('2570 rejects unsorted ids', () => {
  assert.throws(() => parseInput('{"nums1":[[2,1],[1,1]],"nums2":[[3,1]]}'))
})

// Independent oracle: add every value into a map keyed by id, then sort by id.
function oracle(nums1, nums2) {
  const sums = new Map()
  for (const [id, v] of [...nums1, ...nums2]) sums.set(id, (sums.get(id) || 0) + v)
  return [...sums.entries()].sort((a, b) => a[0] - b[0])
}

test('2570 random lists match a map-based oracle', () => {
  let seed = 2570
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  const list = () => {
    const ids = Array.from({ length: 10 }, (_, k) => k + 1).filter(() => rnd(2) === 0)
    return ids.slice(0, 8).map(id => [id, 1 + rnd(50)])
  }
  for (let t = 0; t < 200; t++) {
    const a = list()
    const b = list()
    if (a.length === 0 || b.length === 0) continue
    assert.deepEqual(solve(a, b), oracle(a, b), JSON.stringify({ a, b }))
  }
})
