import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, code, python, phases } from './algorithm.js'

const solve = (edges, nums, k) => buildTrace({ edges, nums, k }).result

// Oracle: try every subset of inverted nodes, checking all pairwise distances.
function oracle(edges, nums, k) {
  const n = nums.length
  const graph = Array.from({ length: n }, () => [])
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }
  const dist = Array.from({ length: n }, () => Array(n).fill(-1))
  for (let s = 0; s < n; s++) {
    dist[s][s] = 0
    const queue = [s]
    for (const v of queue) for (const w of graph[v]) if (dist[s][w] < 0) { dist[s][w] = dist[s][v] + 1; queue.push(w) }
  }
  const parent = Array(n).fill(-1)
  const order = [0]
  for (const v of order) for (const w of graph[v]) if (w !== parent[v]) { parent[w] = v; order.push(w) }
  let best = -Infinity
  for (let mask = 0; mask < 1 << n; mask++) {
    let fine = true
    for (let a = 0; a < n && fine; a++) for (let b = a + 1; b < n && fine; b++) {
      if ((mask >> a) & 1 && (mask >> b) & 1 && dist[a][b] < k) fine = false
    }
    if (!fine) continue
    const sign = Array(n).fill(1)
    let total = 0
    for (const v of order) {
      sign[v] = (v === 0 ? 1 : sign[parent[v]]) * ((mask >> v) & 1 ? -1 : 1)
      total += sign[v] * nums[v]
    }
    best = Math.max(best, total)
  }
  return best
}

test('3949 hand-computed cases', () => {
  // invert nothing: all positive already
  assert.equal(solve([[0, 1]], [3, 4], 1), 7)
  // invert node 1
  assert.equal(solve([[0, 1]], [3, -4], 1), 7)
  // k = 1 allows adjacent inversions: invert 0 and then 1, so node 1 is flipped twice: 3 + 4
  assert.equal(solve([[0, 1]], [-3, 4], 1), 7)
  // leaves 2 and 3 are 2 apart, so with k = 2 both flip: 4 + 2 + 9 + 2
  assert.equal(solve([[0, 1], [1, 2], [1, 3]], [4, 2, -9, -2], 2), 17)
  // with k = 5 only one inversion is allowed: flip node 2 for 4 + 2 + 9 - 2
  assert.equal(solve([[0, 1], [1, 2], [1, 3]], [4, 2, -9, -2], 5), 13)
  // the chain 0-1-2-3 with k = 2: inverting only 0 gives 3 - 1 + 1 + 8
  assert.equal(solve([[0, 1], [1, 2], [2, 3]], [-3, 1, -1, -8], 2), 11)
})

test('3949 a pair in different branches is held to the distance too', () => {
  // leaves at distance 2 need k <= 2 to both flip: 1 + 6 + 5 + 2
  const edges = [[0, 1], [0, 2], [0, 3]]
  assert.equal(solve(edges, [1, -6, -5, 2], 2), 14)
  // with k = 3 only one inversion fits, and the root is best: -1 + 6 + 5 - 2
  assert.equal(solve(edges, [1, -6, -5, 2], 3), 8)
})

test('3949 agrees with trying every subset on random trees', () => {
  let seed = 2024
  const random = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let trial = 0; trial < 500; trial++) {
    const n = 2 + random(9)
    const edges = []
    for (let v = 1; v < n; v++) edges.push(trial % 2 ? [random(v), v] : [v, Math.max(0, v - 1 - random(2))])
    const nums = Array.from({ length: n }, () => random(21) - 10)
    const k = 1 + random(trial % 5 === 0 ? 50 : 5)
    assert.equal(solve(edges, nums, k), oracle(edges, nums, k), JSON.stringify({ edges, nums, k }))
  }
})

test('3949 relabelled trees and reversed edge pairs give the same answer', () => {
  const edges = [[1, 0], [2, 0], [3, 1]]
  assert.equal(solve(edges, [1, -2, -3, 4], 2), oracle(edges, [1, -2, -3, 4], 2))
})

test('3949 the reported choice is legal and reaches the answer', () => {
  let seed = 77
  const random = limit => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % limit }
  for (let trial = 0; trial < 200; trial++) {
    const n = 2 + random(9)
    const edges = []
    for (let v = 1; v < n; v++) edges.push([random(v), v])
    const nums = Array.from({ length: n }, () => random(21) - 10)
    const k = 1 + random(5)
    const { frames, result } = buildTrace({ edges, nums, k })
    const { inverted, finalValues } = frames.at(-1)
    assert.equal(finalValues.reduce((sum, value) => sum + value, 0), result)
    const graph = Array.from({ length: n }, () => [])
    for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u) }
    for (const a of inverted) {
      const dist = Array(n).fill(-1)
      dist[a] = 0
      const queue = [a]
      for (const v of queue) for (const w of graph[v]) if (dist[w] < 0) { dist[w] = dist[v] + 1; queue.push(w) }
      for (const b of inverted) if (a !== b) assert.ok(dist[b] >= k)
    }
  }
})

test('3949 parser', () => {
  assert.doesNotThrow(() => parseInput('{"edges":[[0,1]],"nums":[1,2],"k":1}'))
  assert.throws(() => parseInput('{"edges":[],"nums":[1],"k":1}'))
  assert.throws(() => parseInput('{"edges":[[0,1]],"nums":[1,2],"k":0}'))
  assert.throws(() => parseInput('{"edges":[[0,1]],"nums":[1,2],"k":51}'))
  assert.throws(() => parseInput('{"edges":[[0,1],[1,0]],"nums":[1,2,3],"k":1}'))
  assert.throws(() => parseInput('{"edges":[[0,0]],"nums":[1,2],"k":1}'))
  assert.throws(() => parseInput('{"edges":[[0,1]],"nums":[1,50000],"k":1}'))
})

test('3949 frames', () => {
  const pyLines = python.trim().split('\n')
  const ids = new Set(phases.map(p => p.id))
  const { frames, K } = buildTrace({ edges: [[0, 1], [0, 2], [1, 3]], nums: [2, -7, -4, 3], k: 2 })
  assert.equal(K, 2)
  for (const frame of frames) {
    assert.ok(ids.has(frame.phase))
    assert.ok(frame.activeLine >= 1 && frame.activeLine <= code.length)
    assert.ok(pyLines[frame.pythonLine - 1]?.trim())
    assert.ok(frame.message)
    if (frame.matrix) assert.equal(frame.matrix.length, K + 1)
  }
  assert.match(pyLines[frames.find(f => f.phase === 'merge').pythonLine - 1], /merged\(keep, shifted/)
  assert.match(pyLines[frames.find(f => f.phase === 'invert').pythonLine - 1], /keep\[0\] = invert/)
  assert.match(pyLines[frames.at(-1).pythonLine - 1], /return max/)
  // children are processed before their parents
  const visits = frames.filter(f => f.phase === 'visit').map(f => f.v)
  assert.ok(visits.indexOf(3) < visits.indexOf(1))
  assert.ok(visits.indexOf(1) < visits.indexOf(0))
  // frames cannot hold -Infinity once a row is shown
  for (const frame of frames) for (const row of frame.table ?? []) for (const value of row ?? []) assert.notEqual(value, -Infinity)
  // the invert frame marks the too-close descendants
  const invertRoot = frames.find(f => f.phase === 'invert' && f.v === 0)
  assert.deepEqual(invertRoot.blocked.sort(), [1, 2])
})
