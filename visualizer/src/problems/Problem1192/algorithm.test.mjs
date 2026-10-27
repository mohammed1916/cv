import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const connected = (n, edges, skip = -1) => {
  const adj = Array.from({ length: n }, () => [])
  edges.forEach(([u, v], i) => { if (i !== skip) { adj[u].push(v); adj[v].push(u) } })
  const seen = new Set([0]), queue = [0]
  for (let i = 0; i < queue.length; i++) for (const v of adj[queue[i]]) if (!seen.has(v)) { seen.add(v); queue.push(v) }
  return seen.size === n
}
// Oracle: an edge is critical exactly when removing it disconnects the network.
const brute = (n, edges) => edges
  .map(([u, v], i) => (connected(n, edges, i) ? null : [Math.min(u, v), Math.max(u, v)]))
  .filter(Boolean)
  .sort((x, y) => x[0] - y[0] || x[1] - y[1])

test('official examples', () => {
  assert.deepEqual(buildTrace(parseInput('{"n":4,"connections":[[0,1],[1,2],[2,0],[1,3]]}')).result, [[1, 3]])
  assert.deepEqual(buildTrace(parseInput('{"n":6,"connections":[[0,1],[1,2],[2,0],[1,3],[3,4],[4,5],[5,3]]}')).result, [[1, 3]])
  assert.deepEqual(buildTrace(parseInput('{"n":4,"connections":[[0,1],[1,2],[2,3]]}')).result, [[0, 1], [1, 2], [2, 3]])
})

test('matches brute-force bridge detection on seeded random networks', () => {
  let seed = 12345
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
  for (let t = 0; t < 300; t++) {
    const n = 2 + Math.floor(rnd() * 11)
    const edges = []
    const present = new Set()
    const add = (u, v) => { const key = `${Math.min(u, v)},${Math.max(u, v)}`; if (u !== v && !present.has(key)) { present.add(key); edges.push(rnd() < 0.5 ? [u, v] : [v, u]) } }
    for (let v = 1; v < n; v++) add(v, Math.floor(rnd() * v))
    const extra = Math.floor(rnd() * n)
    for (let k = 0; k < extra; k++) add(Math.floor(rnd() * n), Math.floor(rnd() * n))
    const run = buildTrace(parseInput(JSON.stringify({ n, connections: edges })))
    assert.deepEqual(run.result, brute(n, edges))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})

test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"n":3,"connections":[[0,1]]}'))
  assert.throws(() => parseInput('{"n":3,"connections":[[0,0],[1,2]]}'))
  assert.throws(() => parseInput('{"n":3,"connections":[[0,1],[1,0],[1,2]]}'))
  assert.throws(() => parseInput('{"n":1,"connections":[]}'))
  assert.throws(() => parseInput('{"n":13,"connections":[]}'))
})
