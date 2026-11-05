import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { buildTrace, parseInput, python } from './algorithm.js'

const solve = (vals, edges) => buildTrace({ vals, edges }).result
const PY = python.split('\n')
const PYTHON = process.env.PYTHON || 'python3'
const runPy = (vals, edges) => Number(execFileSync(PYTHON, ['-I', '-c', `${python}\nprint(count_good_paths(${JSON.stringify(vals)}, ${JSON.stringify(edges)}))`]).toString().trim())

// Brute force: every pair of nodes (including equal nodes), path by DFS in the tree.
function brute(vals, edges) {
  const n = vals.length
  const adj = Array.from({ length: n }, () => [])
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a) }
  const pathMax = (s, t) => {
    const stack = [[s, -1, [s]]]
    while (stack.length) {
      const [u, p, path] = stack.pop()
      if (u === t) return path
      for (const w of adj[u]) if (w !== p) stack.push([w, u, [...path, w]])
    }
    return null
  }
  let count = 0
  for (let s = 0; s < n; s++) for (let t = s; t < n; t++) {
    const path = pathMax(s, t)
    if (vals[s] !== vals[t]) continue
    if (path.every(v => vals[v] <= vals[s])) count++
  }
  return count
}

test('2421 worked examples', () => {
  assert.equal(solve([2, 2, 1], [[0, 1], [1, 2]]), 4)
  assert.equal(solve([3, 1, 3, 2], [[0, 1], [1, 2], [2, 3]]), 5)
  assert.equal(solve([1], []), 1)
})

test('2421 frames point at real python lines', () => {
  for (const f of buildTrace({ vals: [1, 2], edges: [[0, 1]] }).frames) assert.ok(PY[f.pythonLine - 1].trim() !== '')
})

test('2421 rejects a graph that is not a tree', () => {
  assert.throws(() => parseInput('{"vals":[1,1,1],"edges":[[0,1],[1,2],[2,0]]}'))
})

test('2421 random trees match an exhaustive path search and the python mirror', () => {
  let seed = 2421
  const rnd = m => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return (seed >> 16) % m }
  for (let t = 0; t < 120; t++) {
    const n = 1 + rnd(7)
    const vals = Array.from({ length: n }, () => rnd(3))
    const edges = []
    for (let i = 1; i < n; i++) edges.push([rnd(i), i])
    assert.equal(solve(vals, edges), brute(vals, edges), JSON.stringify({ vals, edges }))
    if (t < 8) assert.equal(runPy(vals, edges), brute(vals, edges))
  }
})
