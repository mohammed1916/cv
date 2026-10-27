import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, edges) => buildTrace({ nums, edges }).result

test('1766 official examples', () => {
  assert.deepEqual(solve([2, 3, 3, 2], [[0, 1], [1, 2], [1, 3]]), [-1, 0, 0, 1])
  assert.deepEqual(solve([5, 6, 10, 2, 3, 6, 15], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]), [-1, 0, -1, 0, 0, 0, -1])
})

test('1766 the nearest coprime ancestor wins over a farther one', () => {
  // Node 2 (value 3) has ancestors 1 (value 2) and 0 (value 1); the nearest coprime is 1.
  assert.deepEqual(solve([1, 2, 3], [[0, 1], [1, 2]]), [-1, 0, 1])
})

test('1766 rejects a cycle and an out-of-range edge', () => {
  assert.throws(() => parseInput('{"nums":[1,2,3],"edges":[[0,1],[1,2]]}') && parseInput('{"nums":[1,2,3],"edges":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"nums":[1,2],"edges":[[0,5]]}'))
})

// Independent oracle: find each node's ancestors by BFS parents, then take the nearest coprime one.
function oracle(nums, edges) {
  const n = nums.length
  const adjacency = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adjacency[a].push(b); adjacency[b].push(a) }
  const parent = Array(n).fill(-1)
  const queue = [0]
  const seen = new Set([0])
  for (let q = 0; q < queue.length; q++) {
    for (const w of adjacency[queue[q]]) if (!seen.has(w)) { seen.add(w); parent[w] = queue[q]; queue.push(w) }
  }
  const euclid = (a, b) => { while (b) [a, b] = [b, a % b]; return a }
  return nums.map((_, v) => {
    for (let a = parent[v]; a !== -1; a = parent[a]) if (euclid(nums[a], nums[v]) === 1) return a
    return -1
  })
}

test('1766 random trees match a BFS-parent oracle', () => {
  let seed = 1766
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const nums = Array.from({ length: n }, () => 1 + rnd(20))
    const edges = []
    for (let i = 1; i < n; i++) edges.push([i, rnd(i)])
    assert.deepEqual(solve(nums, edges), oracle(nums, edges), JSON.stringify({ nums, edges }))
  }
})
