import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

// Independent oracle: try every subset of candidate edges and keep the cheapest one that connects the source and all houses.
function bruteForce(wells, pipes) {
  const n = wells.length
  const edges = [
    ...wells.map((cost, i) => [0, i + 1, cost]),
    ...pipes,
  ]
  let best = Infinity
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    const parent = Array.from({ length: n + 1 }, (_, i) => i)
    const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
    let cost = 0
    for (let e = 0; e < edges.length; e++) {
      if (!(mask & (1 << e))) continue
      const [u, v, c] = edges[e]
      cost += c
      parent[find(u)] = find(v)
    }
    const root = find(0)
    if (Array.from({ length: n + 1 }, (_, i) => find(i)).every(r => r === root)) best = Math.min(best, cost)
  }
  return best
}

// Independent oracle for larger graphs: Prim's algorithm on the complete graph where the source reaches each house by its well.
function prim(wells, pipes) {
  const n = wells.length
  const w = Array.from({ length: n + 1 }, () => Array(n + 1).fill(Infinity))
  wells.forEach((c, i) => { w[0][i + 1] = Math.min(w[0][i + 1], c); w[i + 1][0] = w[0][i + 1] })
  for (const [a, b, c] of pipes) { w[a][b] = Math.min(w[a][b], c); w[b][a] = w[a][b] }
  const inTree = Array(n + 1).fill(false)
  const dist = Array(n + 1).fill(Infinity)
  dist[0] = 0
  let total = 0
  for (let step = 0; step <= n; step++) {
    let u = -1
    for (let i = 0; i <= n; i++) if (!inTree[i] && (u === -1 || dist[i] < dist[u])) u = i
    inTree[u] = true
    total += dist[u]
    for (let v = 0; v <= n; v++) if (!inTree[v] && w[u][v] < dist[v]) dist[v] = w[u][v]
  }
  return total
}

test('houses 1-3 with wells 5, 4, 6 and pipes 1-2 (cost 1) and 2-3 (cost 2) cost 7', () => {
  assert.equal(buildTrace({ wells: [5, 4, 6], pipes: [[1, 2, 1], [2, 3, 2]] }).result, 7)
})

test('without pipes every house needs its own well', () => {
  assert.equal(buildTrace({ wells: [3, 9, 2], pipes: [] }).result, 14)
})

test('expensive pipes lose to individual wells', () => {
  assert.equal(buildTrace({ wells: [1, 1], pipes: [[1, 2, 50]] }).result, 2)
})

test('small random graphs agree with subset enumeration', () => {
  let state = 3
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rand(4)
    const wells = Array.from({ length: n }, () => 1 + rand(20))
    const pipes = []
    const count = rand(5)
    for (let k = 0; k < count && n > 1; k++) {
      const a = 1 + rand(n)
      let b = 1 + rand(n)
      if (b === a) b = a === n ? 1 : a + 1
      pipes.push([a, b, 1 + rand(20)])
    }
    assert.equal(buildTrace({ wells, pipes }).result, bruteForce(wells, pipes), JSON.stringify({ wells, pipes }))
  }
})

test('larger random graphs agree with Prim on the same weights', () => {
  let state = 41
  const rand = m => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state % m }
  for (let t = 0; t < 60; t++) {
    const n = 2 + rand(12)
    const wells = Array.from({ length: n }, () => 1 + rand(100))
    const pipes = Array.from({ length: rand(25) }, () => {
      const a = 1 + rand(n)
      let b = 1 + rand(n)
      if (b === a) b = a === n ? 1 : a + 1
      return [a, b, 1 + rand(100)]
    })
    assert.equal(buildTrace({ wells, pipes }).result, prim(wells, pipes), JSON.stringify({ wells, pipes }))
  }
})

test('frames record each edge decision and end with the result', () => {
  const run = buildTrace({ wells: [5, 4, 6], pipes: [[1, 2, 1], [2, 3, 2]] })
  const decided = run.frames.filter(frame => frame.phase === 'union' && frame.activeLine === 7)
  assert.equal(decided.length, 5)
  assert.equal(run.frames.at(-1).phase, 'done')
  assert.equal(run.frames.at(-1).snapshot.total, 7)
  for (const frame of run.frames) assert.ok(frame.snapshot && frame.message.length > 5)
})

test('invalid input is rejected with a readable message', () => {
  assert.throws(() => parseInput('[]'), /JSON object/)
  assert.throws(() => parseInput({ wells: [], pipes: [] }), /wells must be/)
  assert.throws(() => parseInput({ wells: [1, 2], pipes: [[1, 1, 3]] }), /different houses/)
  assert.throws(() => parseInput({ wells: [1, 2], pipes: [[1, 3, 3]] }), /different houses/)
  assert.throws(() => parseInput({ wells: [1, 2], pipes: [[1, 2]] }), /\[house, house, cost\]/)
})
