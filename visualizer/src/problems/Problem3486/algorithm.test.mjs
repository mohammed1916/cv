import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (edges, nums) => buildTrace({ edges, nums }).result

test('3486 hand-checked case', () => {
  // Path 0-1-2 has values 1,2,1 (one repeat) and length 2 + 3 = 5 over 3 nodes.
  // Path 0-1-3 has values 1,2,3 (no repeat) and length 2 + 4 = 6 over 3 nodes; that beats [5, 3].
  assert.deepEqual(solve([[0, 1, 2], [1, 2, 3], [1, 3, 4]], [1, 2, 1, 3]), [6, 3])
})

test('3486 a value that appears three times ends the path', () => {
  // The path 0-1-2 would hold three 2s, so only the 1-2-3 path (values 2,2,1) of length 2 is legal.
  assert.deepEqual(solve([[0, 1, 1], [1, 2, 1], [2, 3, 1]], [2, 2, 2, 1]), [2, 3])
})

test('3486 a single edge is a path of its own length', () => {
  assert.deepEqual(solve([[0, 1, 4]], [7, 7]), [4, 2])
})

test('3486 the final trace frame reports the result', () => {
  const trace = buildTrace({ edges: [[0, 1, 2], [1, 2, 3], [1, 3, 4]], nums: [1, 2, 1, 3] })
  assert.deepEqual(trace.result, [6, 3])
  assert.equal(trace.frames.at(-1).bestLen, 6)
})

test('3486 rejects malformed input', () => {
  assert.throws(() => parseInput('{"edges":[[0,1,2]],"nums":[1,2,3]}'))
  assert.throws(() => parseInput('{"edges":[[0,1,2],[0,1,2]],"nums":[1,2,3]}'))
  assert.throws(() => parseInput('{"edges":[[0,1,0]],"nums":[1,2]}'))
})

// Independent oracle: every ancestor-descendant pair, path rebuilt from parent links.
function oracle(edges, nums) {
  const n = nums.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v, w] of edges) { adj[u].push([v, w]); adj[v].push([u, w]) }
  const parent = Array(n).fill(-1)
  const weightToParent = Array(n).fill(0)
  const seen = Array(n).fill(false)
  seen[0] = true
  const queue = [0]
  for (const node of queue) {
    for (const [next, w] of adj[node]) {
      if (!seen[next]) { seen[next] = true; parent[next] = node; weightToParent[next] = w; queue.push(next) }
    }
  }
  let best = [0, 1]
  for (let d = 0; d < n; d++) {
    for (let a = d; a !== -1; a = parent[a]) {
      const values = []
      let length = 0
      for (let x = d; ; x = parent[x]) {
        values.push(nums[x])
        if (x === a) break
        length += weightToParent[x]
      }
      const counts = new Map()
      for (const v of values) counts.set(v, (counts.get(v) || 0) + 1)
      const repeated = [...counts.values()].filter(c => c > 1)
      if (repeated.length > 1 || repeated.some(c => c > 2)) continue
      const nodes = values.length
      if (length > best[0] || (length === best[0] && nodes < best[1])) best = [length, nodes]
    }
  }
  return best
}

test('3486 agrees with an oracle on random trees', () => {
  let s = 3486
  const rand = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
  const int = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1))
  for (let t = 0; t < 200; t++) {
    const n = int(2, 9)
    const nums = Array.from({ length: n }, () => int(0, 3))
    const edges = []
    for (let i = 1; i < n; i++) edges.push([int(0, i - 1), i, int(1, 9)])
    assert.deepEqual(solve(edges, nums), oracle(edges, nums))
  }
})
