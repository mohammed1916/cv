import test from 'node:test'
import assert from 'node:assert/strict'
import { parseInput, buildTrace, code, python } from './algorithm.js'

const solve = (n, edges, source, destination) => buildTrace(parseInput(JSON.stringify({ n, edges, source, destination }))).result
// Union-find connectivity as an independent reference.
const connected = (n, edges, a, b) => {
  const parent = Array.from({ length: n }, (_, i) => i)
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])))
  for (const [u, v] of edges) parent[find(u)] = find(v)
  return find(a) === find(b)
}

test('1971 invented graphs', () => {
  assert.equal(solve(3, [[0, 1], [1, 2], [2, 0]], 0, 2), true)
  assert.equal(solve(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5), false)
  assert.equal(solve(3, [], 1, 1), true)
})

test('1971 matches union-find connectivity', () => {
  const edges = [[0, 1], [2, 3], [3, 4], [5, 6], [6, 7], [7, 5], [8, 9]]
  for (let a = 0; a < 10; a++) for (let b = 0; b < 10; b++) assert.equal(solve(10, edges, a, b), connected(10, edges, a, b), `${a}->${b}`)
})

test('1971 frames carry real visited marks, operation kinds and matching lines', () => {
  const input = { n: 4, edges: [[0, 1], [1, 2], [2, 0]], source: 0, destination: 3 }
  const run = buildTrace(parseInput(JSON.stringify(input)))
  assert.equal(run.result, false)
  const kinds = run.frames.map(f => f.kind)
  assert.equal(kinds[0], 'init')
  assert.equal(kinds.at(-1), 'not-found')
  assert.equal(run.frames.at(-1).activeLine, 15)
  // Visited is set when a vertex is enqueued, so vertex 1 and 2 are visited while still in the queue.
  const enqueue = run.frames.find(f => f.kind === 'enqueue' && f.neighbour === 1)
  assert.deepEqual(enqueue.visited, [0, 1])
  assert.deepEqual(enqueue.frontier, [1])
  const skip = run.frames.find(f => f.kind === 'skip')
  assert.ok(skip, 'a visited neighbour produces a skip frame')
  assert.ok(skip.visited.includes(skip.neighbour), 'a skipped neighbour is already marked')
  for (const f of run.frames) assert.ok(code.some(line => line.line === f.activeLine), f.kind)
})

test('1971 found frame maps to the destination check and reports true', () => {
  const run = buildTrace(parseInput('{"n":3,"edges":[[0,1],[1,2]],"source":0,"destination":2}'))
  const last = run.frames.at(-1)
  assert.equal(run.result, true)
  assert.equal(last.kind, 'found')
  assert.equal(last.result, true)
  assert.equal(last.activeLine, 10)
  assert.equal(last.pythonLine, python.split('\n').findIndex(line => line.includes('return True')) + 1)
})

test('1971 source equal to destination and isolated vertices', () => {
  const same = buildTrace(parseInput('{"n":1,"edges":[],"source":0,"destination":0}'))
  assert.deepEqual(same.frames.map(f => f.kind), ['init', 'dequeue', 'found'])
  const isolated = buildTrace(parseInput('{"n":3,"edges":[],"source":1,"destination":2}'))
  assert.equal(isolated.result, false)
  assert.deepEqual(isolated.frames.at(-1).done, [1])
})

test('1971 tutorial keeps real vertex IDs, edges and causal neighbours', async () => {
  const { bfsTutorial, incidentEdges } = await import('./tutorial.js')
  const input = { n: 6, edges: [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], source: 0, destination: 5 }
  const run = buildTrace(parseInput(JSON.stringify(input)))
  for (const step of run.frames) {
    const scene = bfsTutorial({ run, step })
    assert.ok(scene.title && scene.reason && scene.action)
    for (const id of scene.focus.nodes) assert.ok(id < 6)
    for (const [a, b] of scene.focus.edges) assert.ok(input.edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a)), `${a}-${b} is real`)
  }
  assert.deepEqual(incidentEdges(input.edges, 0), [[0, 1], [0, 2]])
  const dequeueOf0 = bfsTutorial({ run, step: run.frames[1] })
  assert.deepEqual(dequeueOf0.focus.nodes, [0, 1, 2])
  assert.equal(dequeueOf0.focus.neighbour, null)
  // Vertices 3-5 are a separate component; they never appear in the focus of vertex 0.
  assert.ok(dequeueOf0.focus.nodes.every(id => id < 3))
  const isolated = bfsTutorial({ run: buildTrace(parseInput('{"n":3,"edges":[],"source":1,"destination":2}')), step: { kind: 'dequeue', current: 1, neighbour: null, visited: [1], frontier: [], done: [], message: '' } })
  assert.deepEqual(isolated.focus.nodes, [1])
  assert.deepEqual(isolated.focus.edges, [])
})
