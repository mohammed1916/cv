import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = (groups, edges) => buildTrace({ groups, edges }).result

test('4018 hand-checked trees', () => {
  assert.equal(solve([1, 2, 1, 2, 1], [[0, 1], [1, 2], [2, 3], [3, 4]]), 10)
  assert.equal(solve([3, 3, 3, 3], [[0, 1], [0, 2], [0, 3]]), 9)
  assert.equal(solve([1, 2, 3, 4], [[0, 1], [1, 2], [2, 3]]), 0)
  assert.equal(solve([5], []), 0)
})

test('4018 rejects malformed trees', () => {
  assert.throws(() => parseInput('{"groups":[1,1],"edges":[]}'))
  assert.throws(() => parseInput('{"groups":[1,1,1],"edges":[[0,1],[0,1]]}'))
  assert.throws(() => parseInput('{"groups":[1,1,1],"edges":[[0,1],[0,0]]}'))
})

// Oracle: breadth-first distances between every pair, summed over same-group pairs.
function oracle(groups, edges) {
  const n = groups.length
  const adj = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { adj[u].push(v); adj[v].push(u) }
  let sum = 0
  for (let s = 0; s < n; s++) {
    const dist = Array(n).fill(-1)
    dist[s] = 0
    const queue = [s]
    for (let i = 0; i < queue.length; i++) {
      for (const w of adj[queue[i]]) if (dist[w] < 0) { dist[w] = dist[queue[i]] + 1; queue.push(w) }
    }
    for (let t = s + 1; t < n; t++) if (groups[t] === groups[s]) sum += dist[t]
  }
  return sum
}

test('4018 random trees match a distance oracle and frames stay valid', () => {
  let seed = 4018
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(9)
    const groups = Array.from({ length: n }, () => 1 + rnd(3))
    const edges = []
    for (let v = 1; v < n; v++) edges.push([rnd(v), v])
    const run = buildTrace({ groups, edges })
    assert.equal(run.result, oracle(groups, edges), JSON.stringify({ groups, edges }))
    for (const f of run.frames) assert.ok(f.activeLine >= 1 && f.activeLine <= run.frames.length + 20)
    assert.equal(run.frames.at(-1).answer, run.result)
  }
})
