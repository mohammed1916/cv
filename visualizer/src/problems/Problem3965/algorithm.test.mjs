import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (durations, edges) => buildTrace({ durations, edges }).result

// Independent oracle: sort nodes by depth (computed by BFS), deepest first, then apply the rule.
function oracle(durations, edges) {
  const n = durations.length
  const kids = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) kids[u].push(v)
  const depth = Array(n).fill(-1)
  depth[0] = 0
  const queue = [0]
  for (let i = 0; i < queue.length; i++) for (const c of kids[queue[i]]) { depth[c] = depth[queue[i]] + 1; queue.push(c) }
  const byDepth = [...Array(n).keys()].sort((a, b) => depth[b] - depth[a])
  const fin = Array(n)
  for (const v of byDepth) {
    if (kids[v].length === 0) fin[v] = durations[v]
    else {
      const e = kids[v].map(c => fin[c])
      fin[v] = 2 * Math.max(...e) - Math.min(...e) + durations[v]
    }
  }
  return fin[0]
}

test('3965 authored presets', () => {
  assert.equal(solve([5, 3, 4, 2], [[0, 1], [0, 2], [2, 3]]), 14)
  assert.equal(solve([1, 1, 1, 1, 1], [[0, 1], [1, 2], [2, 3], [3, 4]]), 5)
})

test('3965 a single task finishes at its duration', () => {
  assert.equal(solve([7], []), 7)
})

test('3965 rejects a bad tree', () => {
  assert.throws(() => parseInput('{"durations":[1,1,1],"edges":[[0,1]]}'))
  assert.throws(() => parseInput('{"durations":[1,1,1],"edges":[[0,1],[2,1]]}'))
  assert.throws(() => parseInput('{"durations":[1,1,1],"edges":[[1,2],[2,1]]}'))
})

test('3965 random trees match the depth-ordered oracle', () => {
  let seed = 3965
  const rnd = n => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % n }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(10)
    const durations = Array.from({ length: n }, () => 1 + rnd(9))
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v])
    assert.equal(solve(durations, edges), oracle(durations, edges), JSON.stringify({ durations, edges }))
  }
})
