import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const run = o => buildTrace(parseInput(JSON.stringify(o)))

// Independent oracle: physically subdivide the graph and BFS over unit edges.
function brute({ edges, maxMoves, n }) {
  let next = n
  const adj = new Map()
  const link = (a, b) => { (adj.get(a) ?? adj.set(a, []).get(a)).push(b); (adj.get(b) ?? adj.set(b, []).get(b)).push(a) }
  for (let i = 0; i < n; i++) adj.set(i, [])
  for (const [u, v, cnt] of edges) {
    let prev = u
    for (let i = 0; i < cnt; i++) { link(prev, next); prev = next++ }
    link(prev, v)
  }
  const dist = new Map([[0, 0]])
  const q = [0]
  for (let h = 0; h < q.length; h++) {
    const x = q[h]
    if (dist.get(x) === maxMoves) continue
    for (const y of adj.get(x)) if (!dist.has(y)) { dist.set(y, dist.get(x) + 1); q.push(y) }
  }
  return dist.size
}

test('official examples', () => {
  assert.equal(run({ edges: [[0, 1, 10], [0, 2, 1], [1, 2, 2]], maxMoves: 6, n: 3 }).result, 13)
  assert.equal(run({ edges: [[0, 1, 4], [1, 2, 6], [0, 2, 8], [1, 3, 1]], maxMoves: 10, n: 4 }).result, 23)
  assert.equal(run({ edges: [[1, 2, 4], [1, 4, 5], [1, 3, 1], [2, 3, 4], [3, 4, 5]], maxMoves: 17, n: 5 }).result, 1)
})

test('matches physical subdivision BFS on random graphs', () => {
  let seed = 3
  const rnd = m => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed % m }
  for (let t = 0; t < 400; t++) {
    const n = 1 + rnd(6)
    const edges = []
    for (let u = 0; u < n; u++) for (let v = u + 1; v < n; v++) if (rnd(2)) edges.push([u, v, rnd(6)])
    const input = { edges, maxMoves: rnd(15), n }
    const trace = run(input)
    assert.equal(trace.result, brute(input), JSON.stringify(input))
    assert.equal(trace.frames.at(-1).phase, 'done')
  }
})

test('rejects invalid input', () => {
  assert.throws(() => parseInput('[]'))
  assert.throws(() => parseInput('{"edges":[[1,0,2]],"maxMoves":3,"n":2}'))
  assert.throws(() => parseInput('{"edges":[[0,5,2]],"maxMoves":3,"n":2}'))
  assert.throws(() => parseInput('{"edges":[[0,1,2],[0,1,3]],"maxMoves":3,"n":2}'))
  assert.throws(() => parseInput('{"edges":[],"maxMoves":3,"n":99}'))
})
