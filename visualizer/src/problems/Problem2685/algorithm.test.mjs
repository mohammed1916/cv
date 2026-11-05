import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (n, edges) => buildTrace(parseInput(JSON.stringify({ n, edges }))).result
const PY = python.split('\n')

test('2685 worked examples', () => {
  assert.equal(solve(6, [[0, 1], [0, 2], [1, 2], [3, 4]]), 3)
  assert.equal(solve(6, [[0, 1], [0, 2], [1, 2], [3, 4], [3, 5]]), 1)
})

test('2685 frames point at real python lines', () => {
  for (const f of buildTrace({ n: 4, edges: [[0, 1], [2, 3], [1, 2]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2685 rejects repeated pairs', () => {
  assert.throws(() => parseInput('{"n":3,"edges":[[0,1],[1,0]]}'))
})

// Oracle: a component is complete when every pair of its vertices is joined by a listed edge.
function oracle(n, edges) {
  const adj = Array.from({ length: n }, () => new Set())
  for (const [a, b] of edges) { adj[a].add(b); adj[b].add(a) }
  const seen = new Array(n).fill(false)
  let count = 0
  for (let s = 0; s < n; s++) {
    if (seen[s]) continue
    const comp = []
    const stack = [s]
    seen[s] = true
    while (stack.length) { const u = stack.pop(); comp.push(u); for (const v of adj[u]) if (!seen[v]) { seen[v] = true; stack.push(v) } }
    if (comp.every(u => comp.every(v => u === v || adj[u].has(v)))) count++
  }
  return count
}

test('2685 random graphs match an oracle', () => {
  let seed = 2685
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 8) % m }
  for (let t = 0; t < 300; t++) {
    const n = 1 + rnd(8)
    const pairs = []
    for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) pairs.push([a, b])
    const edges = pairs.filter(() => rnd(3) === 0)
    assert.equal(solve(n, edges), oracle(n, edges), JSON.stringify({ n, edges }))
  }
})
