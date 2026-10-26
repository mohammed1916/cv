import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace } from './algorithm.js'

const oracle = ({ n, flights, src, dst, k }) => {
  let d = new Array(n).fill(Infinity); d[src] = 0
  for (let r = 0; r <= k; r++) {
    const nd = [...d]
    for (const [u, v, w] of flights) if (d[u] + w < nd[v]) nd[v] = d[u] + w
    d = nd
  }
  return d[dst] === Infinity ? -1 : d[dst]
}
test('official examples', () => {
  assert.equal(buildTrace({ n: 4, flights: [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], src: 0, dst: 3, k: 1 }).result, 700)
  assert.equal(buildTrace({ n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 1 }).result, 200)
  assert.equal(buildTrace({ n: 3, flights: [[0, 1, 100], [1, 2, 100], [0, 2, 500]], src: 0, dst: 2, k: 0 }).result, 500)
})
test('matches Bellman-Ford with k+1 rounds', () => {
  for (let t = 0; t < 400; t++) {
    const n = 2 + Math.floor(Math.random() * 6)
    const flights = []
    for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b && Math.random() < 0.35) flights.push([a, b, 1 + Math.floor(Math.random() * 20)])
    const src = Math.floor(Math.random() * n)
    let dst = Math.floor(Math.random() * n); if (dst === src) dst = (dst + 1) % n
    const p = parseInput(JSON.stringify({ n, flights, src, dst, k: Math.floor(Math.random() * n) }))
    const run = buildTrace(p)
    assert.equal(run.result, oracle(p))
    assert.equal(run.frames.at(-1).phase, 'done')
  }
})
test('invalid input rejected', () => {
  assert.throws(() => parseInput('{"n":3,"flights":[[0,0,1]],"src":0,"dst":1,"k":1}'))
  assert.throws(() => parseInput('{"n":3,"flights":[],"src":1,"dst":1,"k":1}'))
  assert.throws(() => parseInput('[]'))
})
