import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (nums, edges) => buildTrace({ nums, edges }).result

test('3425 worked examples', () => {
  assert.deepEqual(solve([1, 2, 3], [[0, 1, 2], [1, 2, 3]]), [5, 3])
  assert.deepEqual(solve([1, 2, 1], [[0, 1, 2], [1, 2, 3]]), [3, 2])
  assert.deepEqual(solve([1, 1, 2], [[0, 1, 2], [1, 2, 3]]), [3, 2])
  assert.deepEqual(solve([5, 5], [[0, 1, 2]]), [0, 1])
})

test('3425 the longest special path wins over a shorter one', () => {
  // Star at 0 with weights 1, 2, 3 and distinct values: 2-0-3 has length 5 over 3 nodes, longer than 1-0-3 (length 4).
  assert.deepEqual(solve([1, 2, 3, 4], [[0, 1, 1], [0, 2, 2], [0, 3, 3]]), [5, 3])
})

test('3425 rejects a value outside 0 to 4', () => {
  assert.throws(() => parseInput('{"nums":[5,1],"edges":[[0,1,2]]}'))
})

// Independent oracle: every ordered pair of nodes, path found by breadth-first search, checked for distinct values.
function oracle(nums, edges) {
  const n = nums.length
  const adjacency = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adjacency[u].push([v, w]); adjacency[v].push([u, w]) }
  let best = [0, 1]
  for (let s = 0; s < n; s++) {
    const back = Array(n).fill(null)
    back[s] = { prev: -1, weight: 0 }
    const queue = [s]
    for (let q = 0; q < queue.length; q++) {
      for (const [w, c] of adjacency[queue[q]]) if (!back[w]) { back[w] = { prev: queue[q], weight: c }; queue.push(w) }
    }
    for (let t = 0; t < n; t++) {
      const values = new Set()
      let length = 0, count = 0, distinct = true
      for (let x = t; x !== -1; x = back[x].prev) {
        if (values.has(nums[x])) { distinct = false; break }
        values.add(nums[x])
        count++
        if (back[x].prev !== -1) length += back[x].weight
      }
      if (!distinct) continue
      if (length > best[0] || (length === best[0] && count < best[1])) best = [length, count]
    }
  }
  return best
}

test('3425 random trees match a path-enumeration oracle', () => {
  let seed = 3425
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 2 + rnd(5)
    const nums = Array.from({ length: n }, () => rnd(4))
    const edges = []
    for (let i = 1; i < n; i++) edges.push([i, rnd(i), 1 + rnd(5)])
    assert.deepEqual(solve(nums, edges), oracle(nums, edges), JSON.stringify({ nums, edges }))
  }
})
