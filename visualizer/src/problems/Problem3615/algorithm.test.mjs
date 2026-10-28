import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTrace, parseInput } from './algorithm.js'

const solve = input => buildTrace(parseInput(JSON.stringify(input))).result

test('3615 official examples', () => {
  assert.equal(solve({ n: 3, edges: [[0, 1], [1, 2]], label: 'aba' }), 3)
  assert.equal(solve({ n: 3, edges: [[0, 1], [0, 2]], label: 'abc' }), 1)
  assert.equal(solve({ n: 4, edges: [[0, 2], [0, 3], [3, 1]], label: 'bbac' }), 3)
})

test('3615 a single node is a palindrome of length 1', () => {
  assert.equal(solve({ n: 1, edges: [], label: 'z' }), 1)
})

test('3615 rejects a label of the wrong length and a self-loop', () => {
  assert.throws(() => parseInput('{"n":2,"edges":[],"label":"a"}'))
  assert.throws(() => parseInput('{"n":2,"edges":[[1,1]],"label":"aa"}'))
})

// Independent oracle: enumerate every simple path by depth-first search and test each spelling.
function oracle({ n, edges, label }) {
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  let best = 0
  const walk = (path, used) => {
    const word = path.map(x => label[x]).join('')
    if (word === [...word].reverse().join('')) best = Math.max(best, path.length)
    for (const y of adj[path[path.length - 1]]) if (!used[y]) { used[y] = true; walk([...path, y], used); used[y] = false }
  }
  for (let s = 0; s < n; s++) { const used = new Array(n).fill(false); used[s] = true; walk([s], used) }
  return best
}

test('3615 random graphs match a simple-path enumeration oracle', () => {
  let seed = 3615
  // Use the high bits: the low bits of this generator repeat in short cycles.
  const rnd = q => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % q }
  for (let t = 0; t < 200; t++) {
    const n = 1 + rnd(7)
    const edges = []
    const seen = new Set()
    for (let i = 0; i < rnd(12); i++) {
      const a = rnd(n), b = rnd(n)
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`
      if (a === b || seen.has(key)) continue
      seen.add(key)
      edges.push([a, b])
    }
    const label = Array.from({ length: n }, () => 'abc'[rnd(3)]).join('')
    const input = { n, edges, label }
    assert.equal(solve(input), oracle(input), JSON.stringify(input))
  }
})
