import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, phases } from './algorithm.js'

// Independent oracle: for each query, search the graph of edges shorter than its limit.
function oracle({ nodes, edges, queries }) {
  return queries.map(([p, q, limit]) => {
    const seen = new Set([p])
    const stack = [p]
    while (stack.length) {
      const at = stack.pop()
      for (const [u, v, w] of edges) {
        if (w >= limit) continue
        const next = u === at ? v : v === at ? u : -1
        if (next !== -1 && !seen.has(next)) { seen.add(next); stack.push(next) }
      }
    }
    return seen.has(q)
  })
}

function lcg(seed) {
  let state = seed
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state }
}

test('1697 random graphs match a per-query search oracle', () => {
  const next = lcg(2024)
  for (let trial = 0; trial < 400; trial++) {
    const nodes = 1 + (next() % 9)
    const edges = Array.from({ length: next() % 14 }, () => [next() % nodes, next() % nodes, 1 + (next() % 12)])
    const queries = Array.from({ length: 1 + (next() % 8) }, () => [next() % nodes, next() % nodes, 1 + (next() % 13)])
    const input = { nodes, edges, queries }
    const run = buildTrace(input)
    assert.deepEqual(run.result, oracle(input), JSON.stringify(input))
    assert.deepEqual(run.frames.at(-1).snapshot.result, run.result)
  }
})

test('1697 an edge exactly equal to the limit is not used', () => {
  const run = buildTrace({ nodes: 2, edges: [[0, 1, 5]], queries: [[0, 1, 5], [0, 1, 6]] })
  assert.deepEqual(run.result, [false, true])
})

test('1697 answers are returned in the original query order', () => {
  const input = { nodes: 4, edges: [[0, 1, 2], [2, 3, 9]], queries: [[2, 3, 10], [0, 1, 1], [0, 3, 5]] }
  assert.deepEqual(buildTrace(input).result, [true, false, false])
})

test('1697 every phase appears in the trace', () => {
  const run = buildTrace({ nodes: 3, edges: [[0, 1, 1]], queries: [[0, 1, 2]] })
  const used = new Set(run.frames.map(frame => frame.phase))
  for (const phase of phases) assert.ok(used.has(phase.id), phase.id)
})

test('1697 invalid input is rejected', () => {
  const bad = [
    '{"nodes":0,"edges":[],"queries":[[0,0,1]]}',
    '{"nodes":2,"edges":[[0,2,1]],"queries":[[0,1,1]]}',
    '{"nodes":2,"edges":[[0,1,0]],"queries":[[0,1,1]]}',
    '{"nodes":2,"edges":[],"queries":[]}',
    '{"nodes":2,"edges":[[0,1]],"queries":[[0,1,1]]}',
    '{"nodes":2,"edges":[],"queries":[[0,1,1.5]]}',
    'nope',
  ]
  for (const text of bad) assert.throws(() => parseInput(text), text)
  assert.deepEqual(parseInput('{"nodes":2,"edges":[[0,1,3]],"queries":[[0,1,4]]}').nodes, 2)
})
